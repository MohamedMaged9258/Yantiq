import asyncio
import time
import argparse
from pathlib import Path

import httpx

# Default settings
DEFAULT_URL = "http://localhost:8000/predict"
DEFAULT_FILE = "assets/002282_15.wav"
DEFAULT_REQUESTS = 100
DEFAULT_CONCURRENCY = 100


async def send_request(
    client: httpx.AsyncClient, url: str, file_bytes: bytes, idx: int
):
    """Send a single request and return its latency in seconds."""
    files = {"request": ("test.wav", file_bytes, "audio/wav")}
    start = time.perf_counter()
    try:
        resp = await client.post(url, files=files)
        resp.raise_for_status()
        # print(resp.json())
    except Exception as e:
        print(f"Request {idx} failed: {e}")
        return None
    end = time.perf_counter()
    return end - start


async def load_test(
    url: str,
    file_path: str,
    total_requests: int,
    concurrency: int,
):
    # Read the audio file once
    try:
        with open(file_path, "rb") as f:
            file_bytes = f.read()
    except FileNotFoundError:
        print(f"Error: File {file_path} not found.")
        return

    # Create an HTTP client with connection pooling
    limits = httpx.Limits(
        max_keepalive_connections=concurrency, max_connections=concurrency
    )
    async with httpx.AsyncClient(limits=limits, timeout=30.0) as client:
        # Semaphore to limit concurrent requests
        semaphore = asyncio.Semaphore(concurrency)

        async def bounded_send(idx):
            async with semaphore:
                return await send_request(client, url, file_bytes, idx)

        tasks = [bounded_send(i) for i in range(total_requests)]

        print(
            f"Starting load test: {total_requests} requests, concurrency {concurrency}"
        )
        start_time = time.perf_counter()
        latencies = await asyncio.gather(*tasks)
        end_time = time.perf_counter()

    # Filter out failed requests (None values)
    successful_latencies = [lat for lat in latencies if lat is not None]
    success_count = len(successful_latencies)
    failed_count = total_requests - success_count

    if success_count == 0:
        print("No successful requests. Exiting.")
        return

    # Compute metrics
    min_lat = min(successful_latencies)
    max_lat = max(successful_latencies)
    avg_lat = sum(successful_latencies) / success_count
    total_time = end_time - start_time
    throughput = success_count / total_time  # requests per second

    print("\n--- Load Test Results ---")
    print(f"Successful requests: {success_count}")
    print(f"Failed requests: {failed_count}")
    print(f"Total time: {total_time:.2f} s")
    print(f"Throughput: {throughput:.2f} req/s")
    print(
        f"Latency (seconds) - min: {min_lat:.4f}, max: {max_lat:.4f}, avg: {avg_lat:.4f}"
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Simple load test for QuranMuaalemAPI")
    parser.add_argument("--url", type=str, default=DEFAULT_URL, help="API endpoint URL")
    parser.add_argument(
        "--file", type=str, default=DEFAULT_FILE, help="Path to audio file"
    )
    parser.add_argument(
        "--requests",
        "-n",
        type=int,
        default=DEFAULT_REQUESTS,
        help="Number of requests",
    )
    parser.add_argument(
        "--concurrency",
        "-c",
        type=int,
        default=DEFAULT_CONCURRENCY,
        help="Max concurrent requests",
    )
    args = parser.parse_args()

    asyncio.run(load_test(args.url, args.file, args.requests, args.concurrency))
