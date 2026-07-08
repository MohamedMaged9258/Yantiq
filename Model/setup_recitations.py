#!/usr/bin/env python3
"""
One-shot bootstrap: install training deps, then prepare the recitations dataset.

Intended to run on a fresh Linux server. It:
  1. installs the `training` extra (datasets, huggingface_hub, soundfile, librosa, tqdm),
     preferring `uv`, falling back to plain `pip`;
  2. runs `quran_muaalem.data.prepare_recitations` in a SEPARATE process (so the heavy
     `datasets` import happens only after install);
  3. prints the next steps (head resize + training).

All arguments after the known bootstrap flags are forwarded to the prep module, e.g.:

    python setup_recitations.py --configs moshaf_0.0 --max-total 50
    python setup_recitations.py --configs all --max-samples-per-config 5000
    python setup_recitations.py --skip-install --configs moshaf_0.0,moshaf_1.0

Run `python setup_recitations.py -- --help` to see every prep flag.
"""

import shutil
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent
PIP_FALLBACK = ["datasets>=2.19.0,<4.0", "huggingface_hub>=0.23.0",
                "soundfile>=0.12.1", "librosa>=0.11.0", "tqdm>=4.66.0"]


def run(cmd: list[str]) -> int:
    print(f"\n$ {' '.join(cmd)}", flush=True)
    return subprocess.call(cmd, cwd=str(REPO_ROOT))


def install_deps() -> None:
    """Install the training extra, preferring uv and falling back to pip."""
    if shutil.which("uv") or _has_uv_module():
        uv_cmd = (["uv"] if shutil.which("uv")
                  else [sys.executable, "-m", "uv"])
        code = run(uv_cmd + ["sync", "--extra", "training"])
        if code == 0:
            return
        print("uv sync failed; falling back to pip.")

    code = run([sys.executable, "-m", "pip", "install", "-e", ".[training]"])
    if code != 0:
        print("Editable install failed; installing individual packages.")
        code = run([sys.executable, "-m", "pip", "install", *PIP_FALLBACK])
    if code != 0:
        raise SystemExit("Dependency installation failed. See output above.")


def _has_uv_module() -> bool:
    try:
        import uv  # noqa: F401
        return True
    except Exception:
        return False


def main() -> int:
    argv = sys.argv[1:]

    skip_install = False
    if "--skip-install" in argv:
        skip_install = True
        argv.remove("--skip-install")

    # Allow an explicit `--` separator before prep args; strip it if present.
    if argv and argv[0] == "--":
        argv = argv[1:]

    if not skip_install:
        print("=== Step 1/2: installing training dependencies ===")
        install_deps()
    else:
        print("=== Step 1/2: skipped (--skip-install) ===")

    print("\n=== Step 2/2: preparing dataset ===")
    prep_cmd = [sys.executable, "-m", "quran_muaalem.data.prepare_recitations", *argv]
    # Ensure `src/` is importable when running from the repo root.
    env_code = run_with_src_on_path(prep_cmd)
    return env_code


def run_with_src_on_path(cmd: list[str]) -> int:
    import os

    env = os.environ.copy()
    src = str(REPO_ROOT / "src")
    existing = env.get("PYTHONPATH", "")
    env["PYTHONPATH"] = src + (os.pathsep + existing if existing else "")

    # Force single-threaded BLAS. On boxes with a low RLIMIT_NPROC (e.g. 512),
    # OpenBLAS tries to spawn one thread per core and numpy's C-extension import
    # dies with "pthread_create failed / Resource temporarily unavailable". We only
    # do lightweight array work here, so one thread is plenty and avoids the crash.
    for var in ("OPENBLAS_NUM_THREADS", "OMP_NUM_THREADS", "MKL_NUM_THREADS",
                "NUMEXPR_NUM_THREADS", "BLIS_NUM_THREADS"):
        env.setdefault(var, "1")

    # Disable the hf_xet Rust download backend: it spawns a large thread pool and
    # trips "can't start new thread" under the same low nproc cap. Plain-HTTP
    # downloads are slower but single-threaded-friendly.
    env.setdefault("HF_HUB_DISABLE_XET", "1")
    env.setdefault("HF_HUB_DISABLE_TELEMETRY", "1")

    # Raise the soft process/thread cap to the hard cap so the download stack has
    # room for its threads. Inherited by the child process.
    raise_nproc_limit()

    print(f"\n$ PYTHONPATH={src} OPENBLAS_NUM_THREADS=1 HF_HUB_DISABLE_XET=1 {' '.join(cmd)}",
          flush=True)
    return subprocess.call(cmd, cwd=str(REPO_ROOT), env=env)


def raise_nproc_limit() -> None:
    """Raise soft RLIMIT_NPROC to the hard cap (Linux). No-op elsewhere / on failure."""
    try:
        import resource

        soft, hard = resource.getrlimit(resource.RLIMIT_NPROC)
        if hard == resource.RLIM_INFINITY or soft < hard:
            resource.setrlimit(resource.RLIMIT_NPROC, (hard, hard))
            print(f"Raised RLIMIT_NPROC soft limit: {soft} -> {hard}")
    except Exception as e:  # noqa: BLE001 - resource missing (Windows) or not permitted
        print(f"Note: could not raise RLIMIT_NPROC ({e}); relying on current limit.")


if __name__ == "__main__":
    sys.exit(main())
