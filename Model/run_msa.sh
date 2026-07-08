#!/usr/bin/env bash
#
# Environment wrapper for the MSA torch-heavy steps (head adapt + training) on boxes
# with a low process/thread cap. OpenBLAS reads its thread count at process start and,
# on a 64-core host with RLIMIT_NPROC=512, tries to spawn 64 threads per process and
# dies ("pthread_create failed / Resource temporarily unavailable"). This wrapper:
#   - raises the soft nproc limit to the hard cap,
#   - forces single-threaded BLAS (plenty for our work),
#   - disables the thread-heavy hf_xet download backend,
# then execs whatever command you pass.
#
# Usage:
#   ./run_msa.sh python3 -c "from src.quran_muaalem.modeling.adapt_model_for_msa import adapt_model_for_msa; adapt_model_for_msa()"
#   ./run_msa.sh python3 train_msa_simple.py --model_name checkpoints/msa_model_adapted --device cpu --epochs 1 --batch_size 1 --max_samples 20

set -e

# Raise soft process/thread limit to the hard cap (no-op if already there / not allowed).
hard_nproc="$(ulimit -Hu 2>/dev/null || echo unlimited)"
ulimit -u "$hard_nproc" 2>/dev/null || true

export OPENBLAS_NUM_THREADS="${OPENBLAS_NUM_THREADS:-1}"
export OMP_NUM_THREADS="${OMP_NUM_THREADS:-1}"
export MKL_NUM_THREADS="${MKL_NUM_THREADS:-1}"
export NUMEXPR_NUM_THREADS="${NUMEXPR_NUM_THREADS:-1}"
export BLIS_NUM_THREADS="${BLIS_NUM_THREADS:-1}"
export HF_HUB_DISABLE_XET="${HF_HUB_DISABLE_XET:-1}"
export HF_HUB_DISABLE_TELEMETRY="${HF_HUB_DISABLE_TELEMETRY:-1}"

echo "run_msa: nproc soft=$(ulimit -Su) hard=$(ulimit -Hu), OPENBLAS_NUM_THREADS=$OPENBLAS_NUM_THREADS"
echo "run_msa: exec $*"
exec "$@"
