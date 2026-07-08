"""
MSA Fine-Tuning Training Script
Trains the model on Modern Standard Arabic phonemes using Common Voice data
"""

import argparse
import json
import re
import shutil
from pathlib import Path
from typing import Optional

import torch
import torch.nn as nn
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR
from torch.utils.data import DataLoader, Subset
from torch.nn import CTCLoss
from tqdm import tqdm
from transformers import AutoFeatureExtractor, AutoConfig

from ..data.msa_dataset import MSAPhonemeDataset
from ..modeling.msa_tokenizer import MSATokenizer
from ..modeling.modeling_multi_level_ctc import Wav2Vec2BertForMultilevelCTC


class CTCTrainer:
    """Trainer for CTC-based phoneme recognition."""

    def __init__(
        self,
        model,
        train_loader,
        val_loader,
        device: str = "cuda",
        lr: float = 1e-4,
        num_epochs: int = 20,
        save_dir: str = "checkpoints/msa_model",
        accumulation_steps: int = 1,
        feature_extractor=None,
        keep_last_n_checkpoints: int = 3,
        start_epoch: int = 0,
    ):
        self.device = torch.device(device)
        self.model = model.to(self.device)
        self.train_loader = train_loader
        self.val_loader = val_loader
        self.num_epochs = num_epochs
        self.save_dir = Path(save_dir)
        self.save_dir.mkdir(parents=True, exist_ok=True)
        self.accumulation_steps = accumulation_steps
        self.feature_extractor = feature_extractor
        self.keep_last_n_checkpoints = keep_last_n_checkpoints
        self.start_epoch = start_epoch

        trainable = [p for p in self.model.parameters() if p.requires_grad]
        self.optimizer = AdamW(trainable, lr=lr, weight_decay=0.01)
        self.scheduler = CosineAnnealingLR(self.optimizer, T_max=num_epochs)
        self.ctc_loss = CTCLoss(blank=0, zero_infinity=True)

        self.best_val_loss = float("inf")
        self.history = {"train_loss": [], "val_loss": [], "lr": []}

        # Restore state from a previous run if a history file already exists.
        history_path = self.save_dir / "training_history.json"
        if history_path.exists() and start_epoch > 0:
            with open(history_path, encoding="utf-8") as f:
                self.history = json.load(f)
            past_val = self.history.get("val_loss", [])
            if past_val:
                self.best_val_loss = min(past_val)
            print(f"Resumed from epoch {start_epoch}; best val_loss so far: {self.best_val_loss:.4f}")

    def _save_pretrained(self, path: Path) -> None:
        """Save the model and (if available) the feature extractor side-by-side
        so the checkpoint is self-contained for `AutoFeatureExtractor.from_pretrained`."""
        self.model.save_pretrained(path)
        if self.feature_extractor is not None:
            self.feature_extractor.save_pretrained(path)

    def _rotate_checkpoints(self) -> None:
        """Delete old epoch checkpoints, keeping only the last N."""
        if self.keep_last_n_checkpoints <= 0:
            return
        pattern = re.compile(r"checkpoint_epoch_(\d+)$")
        ckpts = sorted(
            [d for d in self.save_dir.iterdir() if d.is_dir() and pattern.match(d.name)],
            key=lambda d: int(pattern.match(d.name).group(1)),
        )
        for old in ckpts[: -self.keep_last_n_checkpoints]:
            shutil.rmtree(old)

    def _forward_loss(self, batch) -> torch.Tensor:
        """Run a forward pass and compute CTC loss on the phonemes head."""
        # Cast input to the model's dtype so layer_norm doesn't mix bf16 weights
        # with fp32 activations. Mask stays integer.
        input_features = batch["input_features"].to(self.device, dtype=self.model.dtype)
        attention_mask = batch["attention_mask"].to(self.device)
        labels = batch["labels"].to(self.device)

        outputs = self.model(
            input_features, attention_mask=attention_mask, return_dict=True
        )
        # outputs.logits is a {level: tensor} dict; we only train phonemes.
        logits = outputs.logits["phonemes"]  # (batch, T_enc, vocab)

        # CTC requires input_lengths to match logits' time dim, NOT the
        # attention mask sum (encoder downsamples ~2x).
        batch_size, logits_time, _ = logits.shape
        input_lengths = torch.full(
            (batch_size,), logits_time, dtype=torch.long, device="cpu"
        )
        target_lengths = (labels != 0).sum(dim=1).cpu()

        # CTC needs fp32 log_probs.
        log_probs = torch.nn.functional.log_softmax(
            logits.transpose(0, 1).float(), dim=-1
        )
        return self.ctc_loss(log_probs, labels, input_lengths, target_lengths)

    def train_epoch(self, epoch: int) -> float:
        """Train for one epoch."""
        self.model.train()
        total_loss = 0
        num_batches = 0

        pbar = tqdm(self.train_loader, desc=f"Train Epoch {epoch+1}")
        for batch_idx, batch in enumerate(pbar):
            loss = self._forward_loss(batch)
            loss = loss / self.accumulation_steps
            loss.backward()

            if (batch_idx + 1) % self.accumulation_steps == 0:
                torch.nn.utils.clip_grad_norm_(self.model.parameters(), max_norm=1.0)
                self.optimizer.step()
                self.optimizer.zero_grad()

            total_loss += loss.item() * self.accumulation_steps
            num_batches += 1
            pbar.set_postfix({
                "loss": loss.item() * self.accumulation_steps,
                "lr": self.optimizer.param_groups[0]['lr'],
            })

        avg_loss = total_loss / num_batches
        return avg_loss

    def validate(self) -> float:
        """Validate on validation set."""
        self.model.eval()
        total_loss = 0
        num_batches = 0

        with torch.no_grad():
            pbar = tqdm(self.val_loader, desc="Validating")
            for batch in pbar:
                loss = self._forward_loss(batch)
                total_loss += loss.item()
                num_batches += 1

        return total_loss / num_batches

    def train(self):
        """Full training loop."""
        print(f"\n{'='*70}")
        print(f"Starting MSA Fine-Tuning Training")
        print(f"{'='*70}")
        print(f"Device: {self.device}")
        print(f"Epochs: {self.num_epochs}")
        print(f"Train samples: {len(self.train_loader.dataset)}")
        print(f"Val samples: {len(self.val_loader.dataset)}")
        print(f"{'='*70}\n")

        for epoch in range(self.start_epoch, self.num_epochs):
            # Train
            train_loss = self.train_epoch(epoch)

            # Validate
            val_loss = self.validate()

            # Schedule
            self.scheduler.step()

            # Record history
            self.history["train_loss"].append(train_loss)
            self.history["val_loss"].append(val_loss)
            self.history["lr"].append(self.optimizer.param_groups[0]["lr"])

            # Log
            print(f"\nEpoch {epoch+1}/{self.num_epochs}")
            print(f"  Train Loss: {train_loss:.4f}")
            print(f"  Val Loss:   {val_loss:.4f}")
            print(f"  LR:         {self.optimizer.param_groups[0]['lr']:.6f}")

            # Save best model
            if val_loss < self.best_val_loss:
                self.best_val_loss = val_loss
                best_path = self.save_dir / "best_model"
                self._save_pretrained(best_path)
                print(f"  Saved best model (val_loss: {val_loss:.4f})")

            # Save checkpoint then prune old ones so disk usage stays bounded.
            ckpt_path = self.save_dir / f"checkpoint_epoch_{epoch+1}"
            self._save_pretrained(ckpt_path)
            self._rotate_checkpoints()

        # Save training history
        history_path = self.save_dir / "training_history.json"
        with open(history_path, "w", encoding="utf-8") as f:
            json.dump(self.history, f, indent=2)

        print(f"\n{'='*70}")
        print(f"Training Complete!")
        print(f"Best model saved to: {self.save_dir / 'best_model'}")
        print(f"Training history saved to: {history_path}")
        print(f"{'='*70}\n")


def load_model_for_msa(model_name: str, device: str = "cuda") -> nn.Module:
    """Load pre-trained model and freeze everything except the MSA phoneme head.

    Freezing the encoder is the whole point of this fine-tune: it dropped pre-training
    on 53k hours of speech and the head only needs to relearn the new vocabulary
    mapping. Skipping gradients/optimizer state for ~600M parameters cuts GPU
    memory roughly in half and makes training fit on a 4 GB card.
    """
    print("Loading pre-trained model...")

    model = Wav2Vec2BertForMultilevelCTC.from_pretrained(
        model_name,
        torch_dtype=torch.float32 if device == "cpu" else torch.bfloat16,
    )

    # Freeze everything, then re-enable grads only on the phonemes head.
    for p in model.parameters():
        p.requires_grad = False
    for p in model.level_to_lm_head["phonemes"].parameters():
        p.requires_grad = True

    n_total = sum(p.numel() for p in model.parameters())
    n_train = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(
        f"Model loaded: {n_train/1e6:.2f}M trainable / {n_total/1e6:.2f}M total params"
    )
    return model


def select_cuda_device(preferred: int | None = None) -> int:
    """Return a CUDA device index to train on.

    If ``preferred`` is given, validate and use it. Otherwise pick the device with the
    most free memory, scanned via ``torch.cuda.mem_get_info`` (works even when NVML /
    nvidia-smi is unavailable due to a driver/library mismatch).
    """
    n = torch.cuda.device_count()
    if preferred is not None:
        if not (0 <= preferred < n):
            raise ValueError(f"--gpu {preferred} out of range (found {n} CUDA device(s))")
        return preferred

    best_idx, best_free = 0, -1
    for i in range(n):
        free, _ = torch.cuda.mem_get_info(i)
        if free > best_free:
            best_idx, best_free = i, free
    return best_idx


def main():
    parser = argparse.ArgumentParser(description="Train MSA phoneme recognition model")
    parser.add_argument(
        "--manifest",
        type=str,
        default="datasets/msa_speech/manifest.json",
        help="Path to manifest.json",
    )
    parser.add_argument(
        "--model_name",
        type=str,
        default="obadx/muaalem-model-v3_2",
        help="Pre-trained model name or path",
    )
    parser.add_argument(
        "--output_dir",
        type=str,
        default="checkpoints/msa_model_v1",
        help="Directory to save checkpoints",
    )
    parser.add_argument(
        "--epochs",
        type=int,
        default=20,
        help="Number of training epochs",
    )
    parser.add_argument(
        "--batch_size",
        type=int,
        default=4,
        help="Batch size (4-8 for RTX 2050)",
    )
    parser.add_argument(
        "--lr",
        type=float,
        default=1e-4,
        help="Learning rate",
    )
    parser.add_argument(
        "--accumulation_steps",
        type=int,
        default=1,
        help="Gradient accumulation steps",
    )
    parser.add_argument(
        "--device",
        type=str,
        default="cuda",
        help="Device (cuda or cpu)",
    )
    parser.add_argument(
        "--gpu",
        type=int,
        default=None,
        help="CUDA device index to pin training to. If omitted (and --device cuda), "
             "the GPU with the most free memory is chosen automatically. Useful on "
             "shared multi-GPU boxes, especially where nvidia-smi is unavailable.",
    )
    parser.add_argument(
        "--num_workers",
        type=int,
        default=0,
        help="Number of workers for dataloader (0 for CPU on Windows)",
    )
    parser.add_argument(
        "--max_samples",
        type=int,
        default=None,
        help="Limit number of training samples (for quick testing)",
    )
    parser.add_argument(
        "--resume_from",
        type=str,
        default=None,
        help="Checkpoint directory to resume from (e.g. checkpoints/msa_model_v1/checkpoint_epoch_85). "
             "The epoch number is parsed from the directory name.",
    )
    parser.add_argument(
        "--keep_last_n_checkpoints",
        type=int,
        default=3,
        help="Number of recent epoch checkpoints to keep on disk (0 = keep all). Default: 3.",
    )

    args = parser.parse_args()

    # Verify manifest exists
    manifest_path = Path(args.manifest)
    if not manifest_path.exists():
        raise FileNotFoundError(f"Manifest not found: {manifest_path}")

    # Verify device
    if args.device == "cuda" and not torch.cuda.is_available():
        print("CUDA not available, falling back to CPU")
        args.device = "cpu"

    if args.device == "cuda":
        # Pin to one GPU. On shared boxes (and where nvidia-smi/NVML is broken) we
        # pick the freest card via torch itself so we don't OOM on a busy cuda:0.
        gpu_idx = select_cuda_device(args.gpu)
        torch.cuda.set_device(gpu_idx)  # makes unindexed "cuda" resolve to gpu_idx
        free, total = torch.cuda.mem_get_info(gpu_idx)
        print(f"Device: cuda:{gpu_idx} ({torch.cuda.get_device_name(gpu_idx)})")
        print(f"GPU memory: {free/1e9:.1f} GB free / {total/1e9:.1f} GB total")
    else:
        print(f"Device: {args.device}")

    # Create dataloaders
    print("\nLoading datasets...")
    train_dataset = MSAPhonemeDataset(
        args.manifest,
        split="train",
        model_name=args.model_name,
    )
    val_dataset = MSAPhonemeDataset(
        args.manifest,
        split="val",
        model_name=args.model_name,
    )

    # Limit samples if requested (for quick testing)
    if args.max_samples:
        train_dataset = Subset(train_dataset, list(range(min(args.max_samples, len(train_dataset)))))
        val_samples = max(1, args.max_samples // 5)  # Use 20% for validation
        val_dataset = Subset(val_dataset, list(range(min(val_samples, len(val_dataset)))))

    pin_memory = args.device == "cuda" and torch.cuda.is_available()

    train_loader = DataLoader(
        train_dataset,
        batch_size=args.batch_size,
        shuffle=True,
        num_workers=args.num_workers,
        pin_memory=pin_memory,
    )
    val_loader = DataLoader(
        val_dataset,
        batch_size=args.batch_size * 2,
        shuffle=False,
        num_workers=args.num_workers,
        pin_memory=pin_memory,
    )

    print(f"Train samples: {len(train_dataset)}")
    print(f"Val samples: {len(val_dataset)}")

    # Determine which checkpoint to load and what epoch to start from.
    start_epoch = 0
    model_source = args.model_name
    if args.resume_from:
        resume_path = Path(args.resume_from)
        if not resume_path.exists():
            raise FileNotFoundError(f"--resume_from path not found: {resume_path}")
        m = re.search(r"checkpoint_epoch_(\d+)$", str(resume_path))
        if m:
            start_epoch = int(m.group(1))
        else:
            print(f"WARNING: could not parse epoch number from '{resume_path.name}'; starting at epoch 0")
        model_source = str(resume_path)
        print(f"Resuming from {resume_path} (start_epoch={start_epoch})")

    # Load model + the feature extractor that goes with it (so the checkpoint
    # we save can be loaded back by AutoFeatureExtractor.from_pretrained later).
    model = load_model_for_msa(model_source, device=args.device)
    feature_extractor = AutoFeatureExtractor.from_pretrained(model_source)

    # Create trainer
    trainer = CTCTrainer(
        model=model,
        train_loader=train_loader,
        val_loader=val_loader,
        device=args.device,
        lr=args.lr,
        num_epochs=args.epochs,
        save_dir=args.output_dir,
        accumulation_steps=args.accumulation_steps,
        feature_extractor=feature_extractor,
        keep_last_n_checkpoints=args.keep_last_n_checkpoints,
        start_epoch=start_epoch,
    )

    # Start training
    trainer.train()


if __name__ == "__main__":
    main()
