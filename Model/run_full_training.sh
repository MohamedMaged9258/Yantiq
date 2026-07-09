#!/usr/bin/env bash
#
# End-to-end MSA training pipeline: prepare dataset -> adapt phoneme head -> train.
#
# It DETACHES itself into the background (setsid + nohup) so it keeps running after an
# SSH disconnect, streaming all output to a log file. Just run it once; it prints the
# PID and the command to follow the log, then returns.
#
# Usage:
#   chmod +x run_full_training.sh
#   ./run_full_training.sh                          # sensible defaults (all configs, 5000/config)
#   ./run_full_training.sh --configs moshaf_0.0,moshaf_1.0 --epochs 30 --batch-size 32
#   ./run_full_training.sh --max-per-config 0       # 0 = no per-config cap (full dataset)
#   ./run_full_training.sh --install                # also (re)install deps first
#
# Options (all optional):
#   --configs LIST         comma list or 'all'            (default: all)
#   --max-per-config N     cap samples per reciter; 0/none = uncapped  (default: 5000)
#   --text-field FIELD     uthmani | imlaey              (default: uthmani)
#   --audio-format FMT     wav | flac (flac ~halves disk) (default: flac)
#   --max-disk-gb N        stop ingest at N GB of audio (quota guard); 0=off (default: 80)
#   --epochs N             training epochs               (default: 20)
#   --batch-size N         batch size                    (default: 32)
#   --num-workers N        dataloader workers            (default: 4)
#   --gpu N                pin to GPU N (else freest auto-selected)
#   --train-threads N      OPENBLAS/OMP threads for training  (default: 8)
#   --output-dir DIR       checkpoint dir                (default: checkpoints/msa_model_v1)
#   --install              run dependency install (default: skip; deps assumed present)
#   --log FILE             log file                      (default: training_run.log)

# --- resolve absolute paths so relative project paths work regardless of cwd ----------
SCRIPT_PATH="$(cd "$(dirname "$0")" && pwd)/$(basename "$0")"
PROJECT_DIR="$(dirname "$SCRIPT_PATH")"
cd "$PROJECT_DIR"

# --- defaults -------------------------------------------------------------------------
CONFIGS="all"
MAX_PER_CONFIG="5000"
TEXT_FIELD="uthmani"
AUDIO_FORMAT="flac"
MAX_DISK_GB="80"
EPOCHS="20"
BATCH_SIZE="32"
NUM_WORKERS="4"
GPU=""
TRAIN_THREADS="8"
OUTPUT_DIR="checkpoints/msa_model_v1"
INSTALL="0"
LOG_FILE="training_run.log"

ALL_ARGS=("$@")

# --- parse args -----------------------------------------------------------------------
while [ $# -gt 0 ]; do
  case "$1" in
    --configs)        CONFIGS="$2"; shift 2;;
    --max-per-config) MAX_PER_CONFIG="$2"; shift 2;;
    --text-field)     TEXT_FIELD="$2"; shift 2;;
    --audio-format)   AUDIO_FORMAT="$2"; shift 2;;
    --max-disk-gb)    MAX_DISK_GB="$2"; shift 2;;
    --epochs)         EPOCHS="$2"; shift 2;;
    --batch-size)     BATCH_SIZE="$2"; shift 2;;
    --num-workers)    NUM_WORKERS="$2"; shift 2;;
    --gpu)            GPU="$2"; shift 2;;
    --train-threads)  TRAIN_THREADS="$2"; shift 2;;
    --output-dir)     OUTPUT_DIR="$2"; shift 2;;
    --install)        INSTALL="1"; shift;;
    --log)            LOG_FILE="$2"; shift 2;;
    -h|--help)        grep '^#' "$SCRIPT_PATH" | sed 's/^# \{0,1\}//'; exit 0;;
    *) echo "Unknown option: $1 (use --help)"; exit 1;;
  esac
done

# --- self-detach: relaunch in the background, fully disconnected from the terminal ----
if [ "${RUN_FULL_TRAINING_DETACHED:-0}" != "1" ]; then
  PID_FILE="${LOG_FILE%.*}.pid"
  if command -v setsid >/dev/null 2>&1; then
    RUN_FULL_TRAINING_DETACHED=1 setsid nohup "$SCRIPT_PATH" "${ALL_ARGS[@]}" \
        > "$LOG_FILE" 2>&1 < /dev/null &
  else
    RUN_FULL_TRAINING_DETACHED=1 nohup "$SCRIPT_PATH" "${ALL_ARGS[@]}" \
        > "$LOG_FILE" 2>&1 < /dev/null &
  fi
  pid=$!
  echo "$pid" > "$PID_FILE" 2>/dev/null || true
  echo "======================================================================"
  echo " Full training pipeline started in the background."
  echo "   PID:     $pid   (saved to $PID_FILE)"
  echo "   Log:     $PROJECT_DIR/$LOG_FILE"
  echo "   Configs: $CONFIGS   per-config cap: $MAX_PER_CONFIG   text: $TEXT_FIELD"
  echo "   Audio:   $AUDIO_FORMAT   disk budget: ${MAX_DISK_GB} GB"
  echo ""
  echo " Monitor:  tail -f $LOG_FILE"
  echo " Running?  ps -p $pid  (or: pgrep -af train_msa_simple)"
  echo " Stop:     kill $pid   (or: pkill -f train_msa_simple)"
  echo "======================================================================"
  echo " It will keep running even if this SSH session disconnects."
  exit 0
fi

# ======================================================================================
# Detached execution below. Everything from here is written to the log file.
# ======================================================================================
set -e
trap 'echo ""; echo "[run_full_training] *** FAILED (exit $?) at $(date -u) ***"' ERR

echo "======================================================================"
echo " MSA full training pipeline  |  started $(date -u) UTC"
echo " project:     $PROJECT_DIR"
echo " configs:     $CONFIGS   (per-config cap: $MAX_PER_CONFIG, text: $TEXT_FIELD)"
echo " audio:       $AUDIO_FORMAT   (disk budget: ${MAX_DISK_GB} GB)"
echo " training:    epochs=$EPOCHS batch=$BATCH_SIZE workers=$NUM_WORKERS"
echo "              gpu=${GPU:-auto} threads=$TRAIN_THREADS output=$OUTPUT_DIR"
echo "======================================================================"

# --- Step 1/3: prepare dataset --------------------------------------------------------
echo ""; echo "### [1/3] Preparing dataset ($(date -u))"
install_flag="--skip-install"
[ "$INSTALL" = "1" ] && install_flag=""

cap_flag=""
if [ -n "$MAX_PER_CONFIG" ] && [ "$MAX_PER_CONFIG" != "0" ] && [ "$MAX_PER_CONFIG" != "none" ]; then
  cap_flag="--max-samples-per-config $MAX_PER_CONFIG"
fi

disk_flag=""
if [ -n "$MAX_DISK_GB" ] && [ "$MAX_DISK_GB" != "0" ] && [ "$MAX_DISK_GB" != "off" ]; then
  disk_flag="--max-disk-gb $MAX_DISK_GB"
fi

# shellcheck disable=SC2086
python3 setup_recitations.py $install_flag \
    --configs "$CONFIGS" --text-field "$TEXT_FIELD" --audio-format "$AUDIO_FORMAT" \
    $cap_flag $disk_flag

# --- Step 2/3: adapt phoneme head 43 -> 35 (once) -------------------------------------
echo ""; echo "### [2/3] Adapting phoneme head 43 -> 35 ($(date -u))"
if [ -d checkpoints/msa_model_adapted ]; then
  echo "checkpoints/msa_model_adapted already exists; skipping adapt."
else
  ./run_msa.sh python3 -c "from src.quran_muaalem.modeling.adapt_model_for_msa import adapt_model_for_msa; adapt_model_for_msa()"
fi

# --- Step 3/3: train ------------------------------------------------------------------
echo ""; echo "### [3/3] Training ($(date -u))"
gpu_flag=""
[ -n "$GPU" ] && gpu_flag="--gpu $GPU"

# shellcheck disable=SC2086
OPENBLAS_NUM_THREADS="$TRAIN_THREADS" OMP_NUM_THREADS="$TRAIN_THREADS" \
  ./run_msa.sh python3 train_msa_simple.py \
    --model_name checkpoints/msa_model_adapted \
    --device cuda --epochs "$EPOCHS" --batch_size "$BATCH_SIZE" \
    --num_workers "$NUM_WORKERS" --output_dir "$OUTPUT_DIR" $gpu_flag

echo ""; echo "======================================================================"
echo " Pipeline complete ($(date -u)). Best checkpoint: $OUTPUT_DIR/best_model"
echo " Serving default MSA_MODEL_PATH already points at checkpoints/msa_model_v1/best_model"
echo "======================================================================"
