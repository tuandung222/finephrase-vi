---
sidebar_position: 5
sidebar_label: '5. Hạ tầng'
---

# 🏗️ Hạ tầng

Mỗi cấu hình rephrasing (diễn đạt lại) trong số 90 cấu hình của chúng tôi yêu cầu sinh khoảng 10 tỷ token văn bản web. Ngay cả khi sử dụng KV caching (bộ nhớ đệm KV), mỗi token đầu ra vẫn cần một lượt truyền xuôi (forward pass) riêng, và mỗi tài liệu web chứa tới vài nghìn token. Nếu cấu hình phục vụ (serving config) không tối ưu, một lượt chạy sinh dữ liệu có thể mất vài tuần thay vì vài ngày. Nhân con số đó với 90, sự khác biệt giữa một thiết lập tốt và một thiết lập tồi tệ thực sự tương đương với hàng tháng trời chạy GPU.

Nhờ các công cụ suy luận (inference engine) tốc độ cao như [vLLM](https://github.com/vllm-project/vllm) [@vllm] và [SGLang](https://github.com/sgl-project/sglang) [@sglang], tốc độ sinh thô không còn là nút thắt cổ chai nữa. Phần khó khăn nằm ở *hạ tầng* (infrastructure) xung quanh: điều phối hàng ngàn prompt, giữ cho GPU luôn chạy hết công suất, lưu checkpoint cho kết quả đầu ra, và đẩy mọi thứ lên bộ lưu trữ mà không làm mất tiến trình khi một tiến trình con (worker) bị sập.

Chúng tôi đã thực hiện những mở rộng quan trọng cho thư viện [DataTrove](https://github.com/huggingface/datatrove) [@datatrove] để xử lý vấn đề này. DataTrove hỗ trợ cả việc sinh dữ liệu cục bộ lẫn chạy phân tán quy mô lớn trên các cụm Slurm, tự động xử lý việc chia nhỏ dữ liệu (chunking), lưu checkpoint (checkpointing), quản lý hàng đợi phân tán (distributed queueing), và quản lý tập dữ liệu Hugging Face, giúp bạn hoàn toàn tập trung vào thiết kế dữ liệu tổng hợp (synthetic data) thay vì các công đoạn chắp vá vận hành. Chúng tôi đã sử dụng nó cho mọi thí nghiệm trong bài viết này, từ các lượt chạy thử với 10 nghìn ví dụ cho đến toàn bộ pipeline chạy production của FinePhrase.

Dưới đây là sơ đồ tổng quan về pipeline:

<iframe src="/embeds/d3-pipeline.html" width="100%" height="600px" frameBorder="0"></iframe>

> *Hình 5.1: Sơ đồ tổng quan về pipeline sinh dữ liệu tổng hợp của DataTrove. Các tài liệu đi qua một pipeline ba giai đoạn (Read, Transform, Write), với InferenceRunner điều phối các hàm rollout đến vLLM/SGLang. Hệ thống hỗ trợ thực thi cục bộ và trên cụm Slurm với tính năng tự động tải lên và giám sát tiến độ.*

Hãy cùng đi sâu vào chi tiết.

### Sinh dữ liệu tổng hợp ở quy mô lớn

Trọng tâm của hệ thống là tệp `examples/inference/benchmark/generate_data.py`, một entry point (điểm khởi đầu) được xây dựng bằng thư viện [Typer](https://typer.tiangolo.com/) để điều phối toàn bộ chu kỳ sinh dữ liệu tổng hợp:

1. **Read (Đọc)**: Tải bất kỳ phân tách (split) hoặc cấu hình nào từ Hugging Face Hub thông qua `HuggingFaceDatasetReader`.
2. **Transform (Biến đổi)**: Truyền các ví dụ qua `InferenceRunner` để giao tiếp với vLLM (hoặc một loại server khác), xử lý việc chia nhỏ dữ liệu, thử lại khi lỗi, và ghi lại chỉ số (metric).
3. **Write (Ghi)**: Đẩy kết quả ngược trở lại Hub bằng `ParquetWriter`.

Nhờ việc khai báo mọi thứ dưới dạng một pipeline của DataTrove, bạn sẽ có được các checkpoint tất định (deterministic checkpoint), khả năng khôi phục tiến trình khi bị gián đoạn, và sự phân tách rõ ràng giữa từng giai đoạn. Không còn những đoạn script tự chế chắp vá bằng bài viết (bash script). Pipeline này có thể dễ dàng mở rộng để khởi chạy các job sinh dữ liệu song song trên cụm Slurm, đồng thời tự động tổng hợp các chỉ số hiệu năng sinh dữ liệu.

DataTrove cung cấp hai chế độ để sinh dữ liệu tổng hợp:

- **Local execution (Chạy cục bộ)**: Chạy trên một máy đơn lẻ với nhiều worker phục vụ cho việc phát triển và sinh dữ liệu quy mô nhỏ.
- **Slurm cluster (Cụm Slurm)**: Phân phối xử lý trên nhiều node cho các tác vụ production quy mô lớn.

Dưới đây là một ví dụ đơn giản về việc chạy cục bộ trên 1 GPU để viết lại các tài liệu từ [FineWeb-Edu](https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu) [@fineweb] thành các bài hướng dẫn từng bước (step-by-step tutorial) bằng mô hình [SmolLM3-3B](https://huggingface.co/HuggingFaceTB/SmolLM3-3B):

```shell
python examples/inference/benchmark/generate_data.py \
    --input-dataset-name HuggingFaceFW/fineweb-edu \
    --input-dataset-config sample-10BT \
    --input-dataset-split train \
    --prompt-column text \
    --prompt-template tutorial \
    --model-name-or-path HuggingFaceTB/SmolLM3-3B \
    --model-max-context 8192 \
    --max-tokens 4096 \
    --output-dataset-name fineweb-edu-benchmark \
    --output-dir examples/inference/benchmark/results \
    --seed 42 \
    --temperature 0.0 \
    --max-examples 10000 \
    --examples-per-chunk 500 \
    --tasks 1 \
    --tp 1 \
    --local-execution
```

Hầu hết các đối số đều khá trực quan, nhưng hãy cùng xem qua các đối số chính kiểm soát hành vi của pipeline DataTrove:

- `tasks`: kiểm soát số lượng tác vụ (tasks) mà executor sinh ra. Mỗi tác vụ xử lý một phần dữ liệu không trùng lặp từ tập dữ liệu đầu vào.
- `examples-per-chunk`: kiểm soát số lượng prompt được xử lý đồng thời trước khi lưu checkpoint.
- `tp`: kiểm soát kích thước song song hóa tensor (tensor parallel).

Các chunk lớn hơn sẽ cải thiện hiệu suất xử lý (throughput) nhưng cũng làm tăng lượng công việc bị mất nếu bạn cần khôi phục lại tiến trình, vì vậy hãy điều chỉnh `examples-per-chunk` sao cho phù hợp, đồng thời sử dụng `tasks` chủ yếu để phân chia khối lượng công việc trên các job độc lập. Đó là cấu trúc của một pipeline cơ bản. Nhưng làm thế nào để bạn tùy chỉnh những gì xảy ra bên trong bước sinh dữ liệu?

### Custom Rollouts: Điều phối linh hoạt suy luận LLM

Trọng tâm của hệ thống suy luận của chúng tôi nằm ở một lớp trừu tượng mạnh mẽ: **hàm rollout**. Một rollout đơn giản là một async callable (đối tượng có thể gọi bất đồng bộ) nhận vào một `Document`, một hàm callback `generate(payload)`, và các tài nguyên bổ sung mà bạn đã cấu hình. Bên trong hàm rollout, bạn hoàn toàn tự do điều phối một hoặc nhiều lệnh gọi `generate`: tuần tự, song song, hoặc bất kỳ sự kết hợp nào.

Thiết kế này tách biệt *những gì* bạn muốn sinh ra khỏi cách thức mà engine suy luận gom cụm (batch) và thực thi các yêu cầu. Bạn chỉ cần tập trung vào logic ứng dụng của mình. Trình chạy (runner) sẽ xử lý việc tối ưu hóa hiệu suất GPU.

> [!NOTE]
> 📝 **Ghi chú**
> Đối với tác vụ rephrasing, bạn chỉ cần một hàm rollout gửi yêu cầu đơn giản. Các mô hình rollout khác dưới đây sẽ minh họa cách DataTrove xử lý các trường hợp sử dụng phức tạp hơn như dịch các tài liệu dài, tiền xử lý nặng trên CPU, và lấy mẫu best-of-N.

<details>
<summary>Hàm rollout gửi yêu cầu đơn giản (Simple single-request rollout)</summary>

Hàm rollout đơn giản nhất gửi một yêu cầu cho mỗi tài liệu và trả về kết quả trực tiếp:

```python
async def simple_rollout(
    document: Document, generate: Callable
) -> InferenceResult:
    payload = {
        "messages": [{"role": "user", "content": document.text}],
        "max_tokens": 2048,
    }
    return await generate(payload)
```

Kết quả `InferenceResult` trả về sẽ tự động được lưu trữ trong `document.metadata["rollout_results"]`.

**Trường hợp sử dụng: Diễn đạt lại (rephrasing) tài liệu web để huấn luyện LLM.** Bạn đang xây dựng một tập dữ liệu huấn luyện bằng cách diễn đạt lại các tài liệu web thành văn phong sạch và nhất quán hơn. Hầu hết các tài liệu đều vừa vặn với ngữ cảnh, đầu ra dưới 4k token, và bạn muốn giảm thiểu tối đa chi phí tài nguyên phát sinh (overhead). Chỉ cần một yêu cầu cho mỗi tài liệu, không cần logic chia nhỏ, không cần điều phối phức tạp. Hàm rollout bọc mỗi tài liệu trong một prompt diễn đạt lại và trả về văn bản đã viết lại một cách trực tiếp.

</details>

<details>
<summary>Hàm rollout chia nhỏ (Chunked rollout) cho tài liệu dài</summary>

Khi tài liệu vượt quá cửa sổ ngữ cảnh (context window) của mô hình, bạn có thể chia chúng thành các đoạn nhỏ (chunks) và ghép các đoạn dữ liệu được sinh ra lại với nhau:

```python
async def chunked_rollout(
    document: Document, generate: Callable
) -> str:
    max_chars = 4000
    text = document.text
    chunks = [
        text[i : i + max_chars]
        for i in range(0, len(text), max_chars)
    ]

    generations = []
    for chunk in chunks:
        prev = generations[-1] if generations else ""
        payload = {
            "messages": [
                {"role": "user", "content": f"Rewrite:\\n{chunk}"},
                {"role": "assistant", "content": prev},
            ],
            "continue_final_message": True,
        }
        result = await generate(payload)
        generations.append(result.text)

    return "\\n".join(generations)
```

Mỗi đoạn dữ liệu sinh ra sẽ kế thừa ngữ cảnh từ phần sinh trước đó, cho phép mô hình duy trì tính mạch lạc trên toàn bộ tài liệu.

**Trường hợp sử dụng: Dịch tài liệu web dài.** Bạn đang dịch nội dung web đa ngôn ngữ sang tiếng Anh ở quy mô lớn. Nhiều tài liệu vượt quá giới hạn ngữ cảnh, vì vậy bạn chia chúng thành các chunk 512-token và dịch bằng một cửa sổ trượt (sliding window). Mỗi chunk được dịch trong khi vẫn giữ chunk trước đó (đã dịch xong) trong prompt làm ngữ cảnh. Điều này giúp duy trì tính mạch lạc qua ranh giới giữa các chunk. Dự án [FineTranslations](https://huggingface.co/datasets/HuggingFaceFW/finetranslations) đã sử dụng cách tiếp cận này để dịch hơn 1 nghìn tỷ token trên hơn 500 ngôn ngữ.

</details>

<details>
<summary>Tiền xử lý nặng trên CPU với Process Pools</summary>

Đối với các hàm rollout yêu cầu các tác vụ CPU nặng (như parse dữ liệu, xử lý ảnh, v.v.), bạn có thể chuyển tải xử lý sang một process pool thông qua `shared_context`:

```python
def cpu_heavy_build_payload(
    doc: Document, page: int
) -> dict:
    # Tiền xử lý tốn tài nguyên CPU (ví dụ: PDF parsing, OCR)
    return {
        "messages": [
            {"role": "user", "content": f"[page {page}] {doc.text}"},
        ]
    }

async def heavy_cpu_rollout(
    document: Document,
    generate: Callable,
    process_pool: ProcessPoolExecutor,
) -> list[InferenceResult]:
    loop = asyncio.get_running_loop()

    async def process_page(page: int) -> InferenceResult:
        payload = await loop.run_in_executor(
            process_pool,
            cpu_heavy_build_payload,
            document,
            page,
        )
        return await generate(payload)

    return await asyncio.gather(
        *[process_page(p) for p in [1, 2]]
    )
```

Cấu hình ngữ cảnh dùng chung (shared context) khi tạo runner:

```python
@contextmanager
def process_pool_context(max_workers: int = 100):
    with ProcessPoolExecutor(max_workers=max_workers) as pool:
        yield {"process_pool": pool}

InferenceRunner(
    rollout_fn=heavy_cpu_rollout,
    shared_context=partial(process_pool_context, max_workers=100),
    ...
)
```

Process pool được khởi tạo dưới dạng lazy (chỉ khi cần) và được chia sẻ trên tất cả các lượt gọi rollout, giúp giữ các tác vụ bị giới hạn bởi CPU (CPU-bound) tránh xa khỏi vòng lặp sự kiện bất đồng bộ (async event loop).

**Trường hợp sử dụng: Hiểu tài liệu PDF.** Bạn đang xây dựng một pipeline để trích xuất thông tin có cấu trúc từ các tệp PDF được quét (scanned PDFs). Mỗi tài liệu yêu cầu tiền xử lý OCR tốn nhiều tài nguyên CPU trước khi văn bản có thể được gửi đến LLM để trích xuất. Bằng cách đẩy tác vụ OCR sang một process pool, bạn có thể giữ cho GPU luôn được cung cấp các yêu cầu sinh dữ liệu trong khi các worker xử lý phần phân tích cú pháp song song.

</details>

<details>
<summary>Nhiều rollout trên mỗi tài liệu (Multiple rollouts per document)</summary>

Bạn cần nhiều mẫu thử (samples) cho mỗi tài liệu? Hãy thiết lập `rollouts_per_document` trong `InferenceConfig` của bạn. Tất cả các kết quả đầu ra thành công sẽ được thu thập trong `document.metadata["rollout_results"]` dưới dạng một danh sách (list).

**Trường hợp sử dụng: Lấy mẫu Best-of-N cho tác vụ sinh code.** Khi sinh các giải pháp lập trình, bạn muốn thử nghiệm nhiều lần cho mỗi bài toán để tăng cơ hội có được câu trả lời chính xác. Hãy đặt `rollouts_per_document=10` và sau đó lọc các giải pháp vượt qua bộ kiểm thử (test suite) của bạn.

</details>

Khi pipeline và các lớp trừu tượng rollout đã sẵn sàng, câu hỏi tiếp theo thuần túy là về tốc độ: làm thế nào để tối đa hóa số token trên giây cho mỗi mô hình?

### Đánh giá hiệu năng xử lý (Throughput Benchmarking)

Khi pipeline đã đi vào hoạt động ổn định, chúng tôi chuyển hướng sang một câu hỏi có thể giúp tiết kiệm (hoặc lãng phí) một lượng tiền khổng lồ: làm thế nào để ép được nhiều token trên giây nhất từ mỗi mô hình? Ở quy mô hoạt động của chúng tôi, ngay cả khi cải thiện được 20% hiệu năng (throughput) cũng giúp tiết kiệm nhiều ngày chạy GPU cho mỗi thí nghiệm.

Chúng tôi đã thực hiện một đợt benchmarking hệ thống trên 18 mô hình và mã nguồn mở toàn bộ thiết lập này (trình khởi chạy thí nghiệm, script phân tích, và cấu hình mẫu) dưới dạng một [thí nghiệm benchmark suy luận của DataTrove](https://github.com/huggingface/datatrove/tree/main/examples/inference/benchmark).

#### Thiết lập Benchmarking

Chúng tôi đã benchmark **18 mô hình** thuộc 4 nhóm kích thước khác nhau (từ siêu nhỏ đến lớn) trên các **GPU H100** (8 GPU mỗi node), sử dụng vLLM làm engine suy luận. Mục tiêu: tìm ra cấu hình phục vụ (serving configuration) tối ưu cho từng mô hình để tối đa hóa số token đầu ra trên giây trên mỗi GPU.

- 🐣 **Tiny (Siêu nhỏ)** (&lt;1B): [SmolLM2-135M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct), [SmolLM2-360M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct), [gemma-3-270m-it](https://huggingface.co/google/gemma-3-270m-it), [Qwen3-0.6B](https://huggingface.co/Qwen/Qwen3-0.6B)
- 🦆 **Small (Nhỏ)** (1B–10B): [SmolLM2-1.7B-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct), [gemma-3-1b-it](https://huggingface.co/google/gemma-3-1b-it), [gemma-3-4b-it](https://huggingface.co/google/gemma-3-4b-it), [Qwen3-1.7B](https://huggingface.co/Qwen/Qwen3-1.7B), [Qwen3-4B](https://huggingface.co/Qwen/Qwen3-4B), [Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)
- 🦅 **Medium (Trung bình)** (10B–100B): [gemma-3-12b-it](https://huggingface.co/google/gemma-3-12b-it), [gemma-3-27b-it](https://huggingface.co/google/gemma-3-27b-it), [Qwen3-14B](https://huggingface.co/Qwen/Qwen3-14B), [Qwen3-32B](https://huggingface.co/Qwen/Qwen3-32B), [Qwen3-30B-A3B](https://huggingface.co/Qwen/Qwen3-30B-A3B), [Qwen3-Next-80B-A3B](https://huggingface.co/Qwen/Qwen3-Next-80B-A3B), [gpt-oss-20b](https://huggingface.co/openai/gpt-oss-20b)
- 🦖 **Large (Lớn)** (100B–500B): [gpt-oss-120b](https://huggingface.co/openai/gpt-oss-120b), [Qwen3-235B-A22B](https://huggingface.co/Qwen/Qwen3-235B-A22B)

Danh sách này bao gồm bốn họ mô hình (SmolLM2, Gemma 3 [@gemma3], Qwen3, và GPT-OSS [@gptoss]), bao gồm cả các kiến trúc transformer đặc (dense) 🧱 và các kiến trúc hỗn hợp chuyên gia (Mixture-of-Experts - MoE) 🔀.

Tất cả các mô hình được đánh giá trên cùng một nhiệm vụ: viết lại các tài liệu từ [HuggingFaceFW/fineweb-edu](https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu) (phần sample-10BT) thành các bài hướng dẫn từng bước. Mỗi lượt chạy xử lý tối đa 10.000 ví dụ với ngữ cảnh tối đa của mô hình là 8.192 token, token đầu ra tối đa là 4.096, và nhiệt độ (temperature) bằng 0.

> [!NOTE]
> 📝 **Ghi chú**
> Do tất cả các lượt chạy đều sử dụng temperature 0.0 và seed cố định là 42, độ lệch biến thiên (variance) giữa các lượt chạy là không đáng kể. Vì vậy, chúng tôi báo cáo các số liệu hiệu năng của một lượt chạy duy nhất mà không cần khoảng tin cậy (confidence intervals).

Tất cả các thí nghiệm đều được thực hiện trên các GPU NVIDIA H100 80GB với 8 GPU trên mỗi node. Chúng tôi sử dụng vLLM làm engine suy luận với tính năng tự động lưu trữ tiền tố (prefix caching) được bật và backend `flash_attn`. Backend vLLM sử dụng Flash-Attn [@flashattention2] cho tốc độ nhanh hơn 50% so với FlashInfer [@flashinfer] trên các thiết lập của chúng tôi. Điều này hoàn toàn trùng khớp với [thứ tự ưu tiên backend](https://docs.vllm.ai/en/latest/design/attention_backends/#backend-priority-cuda) của vLLM: trên Ampere/Hopper (SM 8.x–9.x), Flash Attention được thử nghiệm trước, trong khi trên Blackwell (SM 10.x), FlashInfer có mức ưu tiên cao hơn và có thể sẽ nhanh hơn ở đó. Khi phần cứng và engine đã được cố định, câu hỏi còn lại là các tham số phục vụ nào cần được tối ưu.

#### Tối ưu hóa phân tầng (Tiered Optimization)

Chúng tôi áp dụng phương pháp **tối ưu hóa phân tầng tuần tự gồm hai bước** (two-tier sequential optimization). Phân tầng thứ hai sẽ dựa trên cấu hình tốt nhất tìm được ở phân tầng trước đó:

- **Tier 0** quét qua các tham số `tp`, `mns`, và `mnbt` để tìm cấu hình song song và gom cụm (batching) tối ưu.
- **Tier 1** quét qua `gmu` và `spec` để đạt được mức tăng tốc không suy hao thông qua suy đoán (speculation) và tinh chỉnh bộ nhớ.

**Tier 0** xác định mô hình cần bao nhiêu GPU và có bao nhiêu chuỗi (sequences) có thể xử lý song song. Các tham số quét qua bao gồm:
- **tp**: 1, 2, 4, (8 đối với các mô hình lớn) — mức độ song song hóa tensor trên các GPU.
- **mns**: 256, 512, 1024, 2048, 4096 — số lượng chuỗi đồng thời tối đa.
- **mnbt**: 8192, 16384, 32768 — số lượng token tối đa trên mỗi lượt truyền xuôi.

**Tier 1** sử dụng các cấu hình tp/mns/mnbt tốt nhất từ Tier 0 và quét thêm các tham số:
- **gmu**: 0.9, 0.95 — tỷ lệ bộ nhớ GPU được phân bổ cho bộ nhớ đệm KV cache.
- **spec**: none, ngram-6, ngram-8, suffix-32 — các phương pháp giải mã suy đoán (speculative decoding).

Cách tiếp cận phân tầng này làm giảm đáng kể không gian tìm kiếm. Một phép nhân Descartes (Cartesian product) đầy đủ của tất cả các tham số sẽ yêu cầu khoảng 600 cấu hình cho mỗi mô hình. Cách tiếp cận phân tầng này chỉ cần khoảng 15 + 8 = ~23 cấu hình cho mỗi mô hình. Mặc dù vậy, nhiều cấu hình vẫn có thể bị lỗi hoặc quá thời gian (timeout), vì vậy chúng tôi cần một chiến lược xử lý hợp lý.

> [!NOTE]
> 📝 **Ghi chú**
> Chúng tôi gọi đây là "Tier 0" vì các tham số này là điều kiện tiên quyết: đối với các mô hình lớn hơn, việc chọn đúng `tp` không chỉ là một tối ưu hóa mà là bắt buộc. Nếu thiếu song song hóa tensor, mô hình sẽ bị tràn bộ nhớ (out of memory - OOM) hoặc không còn không gian cho bộ nhớ đệm KV cache. Trong các thử nghiệm thăm dò ban đầu, chúng tôi nhận thấy `tp`, `mns`, và `mnbt` có tác động lớn nhất đến throughput, đó là lý do tại sao chúng cấu thành Tier 0.

#### Chiến lược xử lý quá thời gian (Timeout Strategy)

Tất cả các job được cấp một giới hạn thời gian SLURM khá ngặt nghèo là **~2 giờ** (`1:59:00`). Đây là một quyết định chủ động: các cấu hình không thể hoàn thành 10.000 ví dụ trong vòng 2 giờ sẽ không có tính cạnh tranh. Các cấu hình kém sẽ bị dừng sớm do tràn bộ nhớ (OOM) hoặc quá thời gian (timeout), và chúng tôi chỉ đơn giản là bỏ qua chúng. Điều này cho phép chúng tôi thử nghiệm rộng rãi mà không lãng phí thời gian của cụm tính toán cho các cấu hình không khả thi.

Các loại lỗi được tự động phân loại:
- **OOM**: Tràn bộ nhớ trong quá trình tải mô hình.
- **timeout**: Vượt quá giới hạn thời gian của SLURM (cấu hình chạy quá chậm).
- **server_fail**: Server vLLM không khởi động được (ví dụ: lỗi khởi tạo nhân engine, bộ nhớ GPU không đủ cho mô hình ở mức tp đã chọn).

Kết hợp thiết kế phân tầng với các mức giới hạn thời gian nghiêm ngặt, dưới đây là số lượng cấu hình thực tế chúng tôi đã chạy.

#### Quy mô quét thử nghiệm

Cấu hình benchmark định nghĩa **801 cấu hình độc nhất** trên 8 nhóm thí nghiệm (18 mô hình với khoảng 23 cấu hình mỗi mô hình thông qua phương pháp phân tầng):

| Thí nghiệm | Số cấu hình | Mô tả |
| :--- | :--- | :--- |
| tier0-tiny | 60 | 4 mô hình × tp=1 × 5 mns × 3 mnbt |
| tier0-small | 180 | 6 mô hình × tp=1,2 × 5 mns × 3 mnbt |
| tier0-medium | 315 | 7 mô hình × tp=1,2,4 × 5 mns × 3 mnbt |
| tier0-large | 120 | 2 mô hình × tp=1,2,4,8 × 5 mns × 3 mnbt |
| tier1-tiny | 32 | 4 mô hình × 2 gmu × 4 spec |
| tier1-small | 48 | 6 mô hình × 2 gmu × 4 spec |
| tier1-medium | 56 | 7 mô hình × 2 gmu × 4 spec |
| tier1-large | 8 | 1 mô hình × 2 gmu × 4 spec |

Vậy 801 cấu hình này mang lại cho chúng tôi những kết quả gì?

#### Kết quả

Dưới đây là tiến trình cải thiện hiệu suất từ mức baseline (mặc định của vLLM) qua tối ưu hóa Tier 0 và Tier 1 cho toàn bộ 18 mô hình. Di chuột qua bất kỳ điểm nào trên biểu đồ để xem thông số cấu hình và throughput chi tiết:

<iframe src="/embeds/d3-optimization-sweep.html" width="100%" height="600px" frameBorder="0"></iframe>

> *Hình 5.2: Tối ưu hóa hiệu năng xử lý trên 18 mô hình qua hai tầng. Tier 0 tinh chỉnh các tham số phục vụ (tp, mns, mnbt). Tier 1 bổ sung gpu-memory-utilization và giải mã suy đoán. Hình dạng điểm biểu thị phân tầng, màu sắc biểu thị họ mô hình.*

Biểu đồ cho thấy các mức tăng trưởng rõ rệt, nhưng chúng mang lại giá trị gì trong thực tế về thời gian chạy GPU và chi phí?

#### Ý nghĩa thực tế của các số liệu

Hãy cùng làm một phép tính nhanh để hình dung rõ hơn. Mỗi cấu hình ablation (thử nghiệm loại trừ) của chúng tôi diễn đạt lại khoảng 10 tỷ token. Hãy xem xét mô hình [gpt-oss-120b](https://huggingface.co/openai/gpt-oss-120b), một mô hình MoE mạnh mẽ cân bằng rất tốt giữa chất lượng và throughput. Với cấu hình vLLM baseline mặc định (tp=1, 3.138 tps/gpu), một lượt sinh 10 tỷ token sẽ mất **885 giờ GPU** và tiêu tốn khoảng **2.656 USD** (với mức giá ước tính 3 USD/giờ cho mỗi GPU H100). Khi chuyển sang cấu hình tối ưu (tp=2, 6.117 tps/gpu), con số này giảm xuống còn **454 giờ GPU** và **1.362 USD**. Mức tiết kiệm lên tới **431 giờ GPU và khoảng 1.300 USD** (giảm 49%) chỉ nhờ việc chọn đúng các tham số phục vụ. Nhân với 90 cấu hình diễn đạt lại, sự khác biệt này sẽ giúp tiết kiệm hàng chục nghìn giờ GPU và hơn 100.000 USD.

Các số liệu hiệu năng trên mỗi GPU này cũng trả lời cho một câu hỏi tự nhiên: Cần bao nhiêu GPU để sinh ra **một tỷ token mỗi giờ**? Với các cấu hình được tối ưu hóa từ đợt quét của chúng tôi:

- **SmolLM2-135M** (45.540 tps/gpu): **7 GPU H100** (1 node)
- **Qwen3-4B** (8.086 tps/gpu): **35 GPU H100** (~5 nodes)
- **Qwen3-8B** (6.443 tps/gpu): **44 GPU H100** (~6 nodes)
- **GPT-OSS-120B** (6.117 tps/gpu): **46 GPU H100** (~6 nodes)
- **Gemma-3-27B** (1.724 tps/gpu): **162 GPU H100** (~20 nodes)

Hãy chú ý rằng gpt-oss-120b đạt throughput trên mỗi GPU tương đương với Qwen3-8B mặc dù kích thước của nó lớn hơn rất nhiều. Hai yếu tố giúp đạt được điều này: chỉ có khoảng 5B trong số 120B tham số được kích hoạt trên mỗi token (đặc trưng của MoE), và các trọng số được lượng tử hóa định dạng MXFP4 giúp toàn bộ mô hình nằm vừa vặn trong một GPU 80GB duy nhất. Điều này biến các mô hình MoE lớn thành lựa chọn tối ưu cho hiệu năng trên mỗi GPU: một node gồm 8 GPU chạy gpt-oss-120b sinh ra khoảng 176 triệu token mỗi giờ, và chỉ cần sáu node là bạn đã vượt qua mốc một tỷ token mỗi giờ. Khi bài toán chi phí đã sáng tỏ, hãy cùng đúc rút các quy luật trên cả 18 mô hình.

#### Các phát hiện chính

1. **Tier 0 (song song hóa/gom cụm) mang lại hiệu quả lớn nhất cho các mô hình lớn/MoE.** Mô hình [gpt-oss-120b](https://huggingface.co/openai/gpt-oss-120b) tăng hiệu năng 1,95 lần và [Qwen3-30B-A3B](https://huggingface.co/Qwen/Qwen3-30B-A3B) tăng 1,78 lần chỉ bằng cách chọn đúng cấu hình tp và kích thước batch.
2. **Tier 1 (giải mã suy đoán) mang lại hiệu quả lớn nhất cho các mô hình nhỏ.** Các mô hình SmolLM2 đạt mức tăng hiệu năng từ 1,34 lần đến 1,75 lần nhờ giải mã suy đoán, với các phương pháp tốt nhất là suffix-32 (cho [SmolLM2-1.7B-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct)) và ngram-6 (cho [SmolLM2-135M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct) và [SmolLM2-360M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct)).
3. **Tier 1 thường làm giảm hiệu năng của các mô hình đã được tối ưu tốt trước đó.** Đối với 8 trên tổng số 18 mô hình, cấu hình "tốt nhất" ở Tier 1 thực tế lại tệ hơn cấu hình tốt nhất ở Tier 0. Lý do là vì giải mã suy đoán tạo ra các chi phí phụ hao phí (overhead) không đáng có khi mô hình đã đạt đến trạng thái bão hòa tính toán.
4. **Nhiều mô hình đã đạt trạng thái gần tối ưu ngay với các thông số mặc định.** Các mô hình [gemma-3-27b-it](https://huggingface.co/google/gemma-3-27b-it), [gemma-3-12b-it](https://huggingface.co/google/gemma-3-12b-it), và [Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B) hầu như không thấy sự cải thiện nào (chỉ từ 0% đến 2%), cho thấy các thông số mặc định của vLLM đã được lựa chọn rất tốt cho các dải kích thước mô hình này.

> [!NOTE]
> 📝 **Ghi chú**
> Chúng tôi cũng đã thử nghiệm với các block size phi tiêu chuẩn (khác 16), lượng tử hóa bộ nhớ đệm KV-cache fp8, và lượng tử hóa mô hình 4-bit sử dụng BitsandBytes. Tương tự như [các thí nghiệm trước đây](https://github.com/vllm-project/vllm/issues/6868), không có cài đặt nào mang lại cải thiện throughput nhất quán. Riêng với trường hợp của [SmolLM2-135M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct), cả hai thiết lập lượng tử hóa đều khiến mô hình bị suy thoái và lặp lại từ ngữ liên tục.

Để hiểu tại sao một số mô hình được hưởng lợi nhiều hơn những mô hình khác, hãy cùng điểm lại khái niệm suy luận bị giới hạn bởi bộ nhớ (memory-bound) so với giới hạn bởi tính toán (compute-bound) và cơ chế giải mã suy đoán.

<details>
<summary>Kiến thức nền tảng: Suy luận giới hạn bởi bộ nhớ (Memory-bound) so với giới hạn bởi tính toán (Compute-bound)</summary>

Quá trình suy luận LLM gồm hai pha: **prefill** (xử lý prompt đầu vào song song) và **decode** (sinh từng token tuần tự, sử dụng lại các trạng thái KV cache). Prefill thường là tác vụ **giới hạn bởi tính toán (compute-bound)**: một prompt đầu vào dài có thể làm bão hòa các đơn vị tính toán số học của GPU. Trong khi đó, decode thường là tác vụ **giới hạn bởi băng thông bộ nhớ (memory-bandwidth-bound)**: mỗi bước sinh chỉ tạo ra một token duy nhất nhưng lại yêu cầu đọc toàn bộ trọng số mô hình và trạng thái bộ nhớ đệm KV cache từ bộ nhớ băng thông cao (HBM), khiến các đơn vị tính toán của GPU rơi vào trạng thái nhàn rỗi ([Prefill Decode, 2025](https://prefilldecode.com/); [Qin và các cộng sự, 2025](https://arxiv.org/abs/2512.22066)).

Chế độ **giới hạn bởi bộ nhớ (memory-bound)** khi decode là trạng thái phổ biến của các mô hình lớn hoặc các chuỗi ngữ cảnh dài: GPU dành phần lớn thời gian để chờ chuyển dữ liệu từ HBM thay vì thực hiện tính toán. Việc tăng song song hóa tensor (tp) giúp ích rất nhiều vì nó chia nhỏ mô hình trên nhiều GPU, giảm áp lực bộ nhớ trên từng GPU và giải phóng không gian cho bộ nhớ đệm KV cache lớn hơn, từ đó cho phép batch size lớn hơn và cải thiện throughput. Tài liệu [Ultrascale Playbook](https://huggingface.co/spaces/nanotron/ultrascale-playbook) cung cấp một phân tích rất chi tiết về sự đánh đổi giữa bộ nhớ, tính toán, và truyền thông trong quá trình huấn luyện và suy luận phân tán.

Chế độ **giới hạn bởi tính toán (compute-bound)** khi decode xảy ra với các mô hình nhỏ ở mức batch size lớn: mô hình nằm vừa vặn trong bộ nhớ, nhưng mỗi lượt truyền xuôi vẫn yêu cầu một lượng tính toán cố định trên mỗi token. Giải mã suy đoán giúp ích trong chế độ này bằng cách sinh ra nhiều token trên mỗi bước xác thực, giúp phân bổ đều chi phí tính toán trên mỗi token ([Leviathan và các cộng sự, 2023](https://arxiv.org/abs/2211.17192)).

</details>

<details>
<summary>Kiến thức nền tảng: Giải mã suy đoán (Speculative Decoding)</summary>

**Giải mã suy đoán (speculative decoding)** [@speculativedecoding] hoạt động bằng cách sinh ra các token nháp (draft tokens) với chi phí thấp, sau đó xác thực chúng đồng thời trong một lượt truyền xuôi duy nhất của mô hình đích. Tốc độ tăng tốc phụ thuộc vào **tỷ lệ chấp nhận bản nháp (draft acceptance rate)**: tần suất các token nháp khớp với những gì mô hình đích sẽ sinh ra. Khi tỷ lệ chấp nhận cao, nhiều token được tạo ra trên mỗi lượt truyền xuôi, giúp tiết kiệm chi phí. Khi tỷ lệ này thấp, chi phí phụ hao phí (overhead) cho việc sinh nháp và xác thực có thể khiến tốc độ suy luận thậm chí *chậm hơn* so với giải mã thông thường ([vLLM Blog, 2024](https://vllm-project.github.io/2024/10/17/spec-decode.html)).

Chúng tôi đã thử nghiệm hai phương pháp giải mã suy đoán **không cần mô hình nháp riêng (model-free)** (tức là không yêu cầu thêm trọng số của mô hình nháp phục vụ):

- **N-gram speculation** ([Prompt Lookup Decoding](https://github.com/apoorvumang/prompt-lookup-decoding)) xây dựng một bảng tra cứu n-gram từ prompt đầu vào và so khớp các token được sinh ra gần nhất để đề xuất phần tiếp theo. Phương pháp này hoạt động tốt nhất khi văn bản đầu ra phản chiếu sát văn bản đầu vào (ví dụ: các tác vụ trích xuất, tóm tắt, hoặc viết lại có tính kế thừa nguyên văn). Trong vLLM, tham số `num_speculative_tokens` kiểm soát số lượng token được đề xuất trên mỗi bước ([vLLM Docs](https://docs.vllm.ai/en/latest/features/spec_decode.html)).
- **Suffix speculation** ([SuffixDecoding; Qiao và các cộng sự, 2024](https://arxiv.org/abs/2411.04975)) duy trì một cây hậu tố (suffix tree) trên prompt và các thế hệ sinh trước đó để xác định các chuỗi token lặp lại. Khác với n-gram, phương pháp này sử dụng thống kê tần suất để đề xuất các phần tiếp theo có khả năng xảy ra cao nhất và suy đoán một số lượng token **thích ứng** (adaptive) trên mỗi bước (lên tới `num_speculative_tokens`, mặc định là 32). Nó được thiết kế cho các tác vụ agentic với các mẫu lặp lại và đạt mức tăng tốc lên tới 5,3 lần trên các tác vụ như vậy ([Snowflake Engineering Blog](https://www.snowflake.com/content/snowflake-site/global/en/engineering-blog/suffixdecoding-arctic-inference-vllm)).

Giải mã suy đoán tạo ra các hao phí overhead: bước xác thực tốn chi phí tính toán, và trong vLLM, cả hai phương pháp model-free này hiện đang vô hiệu hóa tính năng lập lịch không đồng bộ (asynchronous scheduling). Ở mức QPS (số truy vấn trên giây) cao, đội ngũ vLLM đã đo được hiệu năng giảm từ 1,4 đến 1,8 lần do giải mã suy đoán cạnh tranh tài nguyên tính toán với các tác vụ khác khi GPU đã bão hòa ([vLLM Blog, 2024](https://vllm-project.github.io/2024/10/17/spec-decode.html)). Đây là lý do tại sao chúng tôi quan sát thấy Tier 1 làm *giảm* hiệu năng trên nhiều mô hình vốn đã được cấu hình tối ưu trước đó.

</details>

#### Tại sao một số mô hình có sự cải thiện lớn hơn?

##### Các mô hình có mức tăng tốc lớn

**[gpt-oss-120b](https://huggingface.co/openai/gpt-oss-120b) và [Qwen3-30B-A3B](https://huggingface.co/Qwen/Qwen3-30B-A3B) (tăng tốc 1,95 lần và 1,78 lần qua tp=2).** Cả hai đều là các mô hình MoE bị **giới hạn bộ nhớ nghiêm trọng ở tp=1**. gpt-oss-120b (tổng số 120B tham số, ~5B tham số kích hoạt) có thể nằm vừa vặn trên một GPU đơn lẻ nhưng hầu như không còn chỗ cho bộ nhớ đệm KV cache: log của server cho thấy dung lượng KV cache chỉ đạt ~45.520 token ở tp=1, chỉ đủ cho khoảng 5 chuỗi chạy đồng thời với chiều dài ngữ cảnh 8.192 token của chúng tôi. Khi chuyển sang tp=2, dung lượng KV cache tăng vọt lên ~810.000 token, đủ cho ~99 chuỗi đồng thời. Chuyển sang tp=2 giúp giảm một nửa bộ nhớ lưu trữ mô hình trên mỗi GPU và tăng khoảng gấp đôi dung lượng KV cache, cho phép scheduler gom cụm nhiều chuỗi hơn. Quy luật tương tự cũng diễn ra với Qwen3-30B-A3B (tổng số 30B tham số, ~3B tham số kích hoạt). Đối với các mô hình MoE lớn này, tp &gt; 1 đóng vai trò tối quan trọng không phải cho tính toán song song mà là để giải phóng **không gian cho KV cache**: chi phí truyền thông chéo GPU là tối thiểu vì chỉ có các tham số được kích hoạt tham gia vào mỗi lượt truyền xuôi.

**Các mô hình SmolLM2 (tăng tốc 1,34–1,75 lần nhờ giải mã suy đoán).** Các mô hình này đủ nhỏ để một GPU đơn lẻ có dư dả bộ nhớ. Nút thắt cổ chai nằm ở tính chất tuần tự của quá trình giải mã tự hồi quy (autoregressive decoding). Giải mã suy đoán sinh ra nhiều token trên mỗi bước xác thực:

- **[SmolLM2-135M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct) với ngram-6**: Log của server hiển thị tỷ lệ chấp nhận bản nháp đạt 72–84% với độ dài chấp nhận trung bình là 5,3–6,0 token. Điều này nghĩa là mỗi bước xác thực tạo ra ~5–6 token thay vì chỉ 1.
- **[SmolLM2-1.7B-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct) với suffix-32**: Đạt tỷ lệ chấp nhận 48–53% với độ dài chấp nhận trung bình là 2,5–3,1 token.

Một chi tiết thú vị là **ngram hoạt động tốt hơn cho mô hình 135M nhưng suffix lại giành chiến thắng ở mô hình 1.7B**. Mô hình 135M sinh ra văn bản lặp lại nhiều hơn, mang tính khuôn mẫu và phản chiếu sát cấu trúc của prompt đầu vào, giúp phương pháp so khớp n-gram đạt tỷ lệ chấp nhận rất cao (72–84%). Mô hình 1.7B sinh ra văn bản đa dạng hơn, có tính diễn đạt lại cao, khiến tỷ lệ chấp nhận của n-gram giảm xuống còn 63–66%. Mặc dù suffix-32 có tỷ lệ chấp nhận trên mỗi token thấp hơn (~48%), nhưng nó đề xuất tới 32 token trên mỗi bước và xác thực chúng trong một batch lớn duy nhất, điều này tối ưu hiệu năng GPU hơn so với các batch 6–8 token nhỏ hơn của n-gram. Kết quả cuối cùng là suffix-32 đạt hiệu năng ~9,2k tps so với ~8,3k tps của ngram-6 trên mô hình 1.7B.

**So sánh với các mô hình suy đoán làm giảm hiệu năng.** Log của server cho thấy sự khác biệt rõ rệt về tỷ lệ chấp nhận bản nháp giữa các mô hình được lợi từ suy đoán và các mô hình không được lợi (tất cả đều sử dụng ngram-6):

| Mô hình | Tỷ lệ chấp nhận TB | Độ dài chấp nhận TB | Tác động hiệu năng |
| :--- | :--- | :--- | :--- |
| [SmolLM2-135M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct) | 72-84% | 5.3-6.0 | **+60%** |
| [SmolLM2-1.7B-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct) | 64-68% | 4.9-5.1 | **+58%** (ngram-6) |
| [gemma-3-270m-it](https://huggingface.co/google/gemma-3-270m-it) | 63-83% | 4.8-6.0 | −2% |
| [Qwen3-14B](https://huggingface.co/Qwen/Qwen3-14B) | 23-50% | 2.4-4.0 | −16% |
| [gemma-3-12b-it](https://huggingface.co/google/gemma-3-12b-it) | 20-24% | 2.2-2.4 | −8% |
| [gemma-3-27b-it](https://huggingface.co/google/gemma-3-27b-it) | 19-26% | 2.1-2.6 | −11% |
| [gpt-oss-120b](https://huggingface.co/openai/gpt-oss-120b) | 20-31% | 2.2-2.9 | −16% |

Các mô hình SmolLM2 nhỏ đạt tỷ lệ chấp nhận từ 64% đến 84% với 5–6 token được chấp nhận trên mỗi bước, giúp giải mã suy đoán mang lại lợi nhuận hiệu năng lớn. Các mô hình kích thước trung bình và lớn ([Qwen3-14B](https://huggingface.co/Qwen/Qwen3-14B), [gemma-3-12b-it](https://huggingface.co/google/gemma-3-12b-it)/[27b-it](https://huggingface.co/google/gemma-3-27b-it), [gpt-oss-120b](https://huggingface.co/openai/gpt-oss-120b)) chỉ đạt tỷ lệ chấp nhận từ 20% đến 30% với ~2,3 token mỗi bước, hầu như không tốt hơn giải mã thông thường. Một lời giải thích hợp lý là các mô hình lớn hơn sinh ra văn bản phong phú, đa dạng hơn và có xu hướng biến đổi cấu trúc so với prompt đầu vào, làm giảm cơ hội tái sử dụng cụm từ chính xác của n-gram. Ở tỷ lệ chấp nhận thấp như vậy, chi phí overhead cho việc sinh nháp và xác thực các token bị từ chối sẽ vượt quá lợi ích mang lại.

Nhiệm vụ viết lại bài hướng dẫn (tutorial-rewriting) đặc biệt phù hợp với giải mã suy đoán vì đầu ra thường chứa nhiều cụm từ lặp lại từ tài liệu gốc, giúp cả hai phương pháp ngram và suffix đạt tỷ lệ chấp nhận cao. Các tác vụ bảo tồn nhiều nội dung gốc hơn nữa (như tóm tắt, viết tiếp văn bản, hoặc viết lại có định hướng nhằm duy trì giọng văn của tác giả) có khả năng sẽ chứng kiến mức tăng tốc thậm chí còn lớn hơn từ giải mã suy đoán. Tuy nhiên, không phải mô hình nào cũng có được cải thiện này.

##### Các mô hình cải thiện ít hoặc không cải thiện

**[gemma-3-27b-it](https://huggingface.co/google/gemma-3-27b-it) (1,00x, cấu hình baseline đã là tối ưu).** Cấu hình mặc định (tp=2, mns=256, mnbt=8192) đã đạt mức tối ưu hóa KV cache từ 97% đến 98% với độ song song tối đa. Không còn nút thắt cổ chai bộ nhớ để giải phóng và cũng không còn dư địa tính toán cho giải mã suy đoán khai thác.

Đáng chú ý, giải mã suy đoán liên tục bị lỗi hoặc làm giảm hiệu năng trên **tất cả** các dải kích thước mô hình Gemma 3:

- **[gemma-3-1b-it](https://huggingface.co/google/gemma-3-1b-it)**: Bị sập với tất cả các phương pháp suy đoán (`server_fail`). Nguyên nhân gốc rễ là lỗi **CUDA OOM trong quá trình khởi động bộ lọc loại bỏ (rejection sampler warmup)**. Bước xác thực giải mã suy đoán trong vLLM thực hiện lệnh gọi `logits.sort(dim=-1)` trên toàn bộ từ vựng trong giai đoạn khởi tạo CUDA graph. Riêng thao tác sort này trên bộ từ vựng khổng lồ của Gemma 3 (~258k token) đã yêu cầu tới ~12 GiB bộ nhớ. Dưới cấu hình tier1-small (`mns=4096`, `mnbt=32768`), giải mã suy đoán cũng làm giảm bộ nhớ đệm KV cache khả dụng (18,8 GiB so với 31,3 GiB khi không dùng suy đoán), chỉ để lại khoảng ~6,5 GiB trống, thấp hơn nhiều so với mức 12 GiB cần thiết. Đây là một vấn đề đặc thù của vLLM: thao tác sort toàn bộ từ từ vựng trong giai đoạn khởi động của rejection sampler tạo nên một nút thắt cổ chai bộ nhớ nghiêm trọng cho các mô hình có từ vựng lớn dưới các thiết lập có độ song song hóa cao.
- **[gemma-3-270m-it](https://huggingface.co/google/gemma-3-270m-it)**: Giải mã suy đoán chạy thành công nhưng lại *làm giảm* hiệu năng xử lý: ngram-6 và ngram-8 giảm ~2%, suffix-32 giảm ~18% (từ 21k xuống 17,8k tps).
- **[gemma-3-4b-it](https://huggingface.co/google/gemma-3-4b-it)**: Hiệu năng giảm 2% khi bật giải mã suy đoán.
- **[gemma-3-27b-it](https://huggingface.co/google/gemma-3-27b-it)**: Hiệu năng giảm 3% khi bật giải mã suy đoán.

> [!NOTE]
> 📝 **Ghi chú**
> **Tại sao Gemma 3 gặp khó khăn với giải mã suy đoán?** Trường hợp của [gemma-3-270m-it](https://huggingface.co/google/gemma-3-270m-it) là một ví dụ điển hình: nó đạt tỷ lệ chấp nhận bản nháp rất cao (63–83%) tương đương với [SmolLM2-135M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct), nhưng giải mã suy đoán vẫn làm giảm 2% throughput. Hai lý do giải thích điều này: Thứ nhất, bộ từ vựng của Gemma 3 là **256k token** so với **49k token** của SmolLM2 (gấp 5,2 lần). Việc vLLM gọi `logits.sort(dim=-1)` trên toàn từ vựng ở bước xác thực khiến mỗi bước trở nên đắt đỏ hơn gấp 5,2 lần (170 triệu trong số 270 triệu tham số của Gemma 3 nằm ở lớp embedding). Thứ hai, SmolLM2-135M-Instruct chạy ở mức mns=512 (~500 chuỗi đồng thời, hiệu suất sử dụng KV cache đạt 43%) trong khi gemma-3-270m-it chỉ chạy ở mns=256 (~250 chuỗi, hiệu suất sử dụng chỉ 5%), khiến SmolLM2 có nhiều tác vụ song song hơn để che giấu độ trễ tính toán của bước xác thực. Nhìn rộng ra, quy luật nhất quán trên các kích thước Gemma 3 gợi ý một sự bất tương thích về mặt kiến trúc: Gemma 3 sử dụng mô hình **attention xen kẽ cục bộ/toàn cục tỷ lệ 5:1** với cửa sổ trượt 1024 token, cấu trúc này có thể tương tác kém hiệu quả với cơ chế sinh-và-xác-thực của giải mã suy đoán.

**[gemma-3-12b-it](https://huggingface.co/google/gemma-3-12b-it), [Qwen3-14B](https://huggingface.co/Qwen/Qwen3-14B), [Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B) (1,00x–1,03x).** Các mô hình dense từ 8B đến 14B này nằm vừa vặn trên 1–2 GPU với đủ dung lượng KV cache cho độ song song cao (~98% hiệu suất sử dụng ở baseline). Chúng không bị giới hạn bộ nhớ (vì vậy việc tăng tp không giúp ích gì, nó chỉ làm tăng chi phí truyền thông chéo GPU mà không giải phóng thêm không gian KV cache đáng kể) và cũng không bị giới hạn tính toán đến mức giải mã suy đoán có thể bù đắp lại (chi phí của việc vô hiệu hóa async scheduling và chạy các bước xác thực lớn hơn lợi ích thu được). Cấu hình mặc định của vLLM về cơ bản đã là tối ưu cho dải kích thước này trên các GPU H100.

##### Tổng hợp các quy luật tối ưu hóa

- **Tăng tp** hữu ích khi mô hình bị giới hạn bởi bộ nhớ (mô hình MoE lớn ở tp=1). Không có tác dụng khi mô hình đã nằm vừa vặn với không gian KV cache dư dả.
- **Tăng mns/mnbt** hữu ích khi bộ nhớ đệm KV cache còn chỗ cho nhiều chuỗi hơn. Không giúp ích khi KV cache đã đạt trạng thái bão hòa.
- **Giải mã suy đoán** hữu ích khi mô hình bị giới hạn bởi tính toán (mô hình nhỏ) VÀ tác vụ có tính đầu ra dễ dự đoán. Không hữu ích khi mô hình bị giới hạn bởi bộ nhớ hoặc đầu ra tác vụ có tính ngẫu nhiên cao.
- **Tăng gmu** hữu ích khi bộ nhớ đệm KV cache là nút thắt cổ chai. Không giúp ích khi trọng số mô hình đã chiếm phần lớn bộ nhớ GPU.

Chìa khóa cốt lõi là **phải xác định chính xác nút thắt cổ chai**: mô hình giới hạn bởi bộ nhớ cần giải pháp song song hóa, mô hình giới hạn bởi tính toán cần cơ chế suy đoán, và các mô hình đã cân bằng tốt sẽ có rất ít dư địa để cải thiện. Tất cả những điều này nhằm tối đa hóa throughput cho các mô hình nhỏ và trung bình, nhưng nếu bạn cần một mô hình lớn hơn nhiều thì sao?

#### Mở rộng lên các mô hình lớn hơn

Tất cả các nội dung trên tập trung vào việc tối đa hóa số token trên giây trên mỗi GPU, đây chính là mục tiêu tối thượng khi sinh hàng nghìn tỷ token dữ liệu pretraining. Nhưng đối với giai đoạn post-training, bài toán lại khác: bạn có thể muốn các mô hình lớn hơn để sinh dữ liệu cho các bài toán khó (suy luận logic, toán học, lập trình), và ít quan tâm hơn đến tổng thể tích dữ liệu. Chất lượng trên mỗi token quan trọng hơn throughput.

Đối với các trường hợp sử dụng này, DataTrove có thể mở rộng để chạy các mô hình với hàng trăm tỷ (hoặc thậm chí cả nghìn tỷ) tham số thông qua thực thi Slurm đa node. Dưới đây là một ví dụ chạy mô hình [Kimi-K2-Instruct](https://huggingface.co/moonshotai/Kimi-K2-Instruct) [@kimik2] (1T tham số, 32B tham số kích hoạt) trên tập dữ liệu [s1K](https://huggingface.co/datasets/simplescaling/s1K-1.1) [@s1k] để sinh giải pháp cho các bài toán toán học và suy luận logic:

```shell
python examples/inference/benchmark/generate_data.py \
    --input-dataset-name simplescaling/s1K-1.1 \
    --input-dataset-split train \
    --prompt-column question \
    --model-name-or-path moonshotai/Kimi-K2-Instruct \
    --model-max-context 32768 \
    --trust-remote-code \
    --output-dataset-name s1K-1.1-Kimi-K2-Instruct \
    --tasks 1 \
    --workers 1 \
    --max-examples 100 \
    --nodes-per-task 2 \
    --tp 8 \
    --pp 2 \
    --optimization-level 0 \
    --max-num-seqs 16
```

Với một mô hình nghìn tỷ tham số, bạn sẽ không sinh được hàng tỷ token mỗi giờ, nhưng bạn không cần phải làm thế. Một vài nghìn chuỗi suy luận (reasoning traces) chất lượng cao từ một mô hình frontier đầu bảng có thể giá trị hơn hàng triệu token từ một mô hình nhỏ hơn nhiều. Để giúp các con số throughput này trở nên trực quan hơn, hãy cùng xem hình ảnh minh họa dưới đây.

#### Trực quan hóa hiệu năng xử lý (Throughput Visualization)

Để cảm nhận rõ hơn ý nghĩa thực tế của các số liệu throughput này, hãy chọn hai mô hình và điều chỉnh số lượng GPU. Mỗi trang tài liệu đại diện cho khoảng 500 token văn bản được sinh ra. Khi throughput đủ lớn, các trang tài liệu sẽ gom thành sách (500 trang mỗi cuốn), và các cuốn sách gom thành kệ sách (500 cuốn mỗi kệ).

<iframe src="/embeds/inference-throughput-compare.html#config=%7B%22modelCount%22%3A%202%7D" width="100%" height="600px" frameBorder="0"></iframe>

> *Hình 5.3: So sánh throughput song song. Chọn hai mô hình và điều chỉnh số lượng GPU để xem tốc độ tương đối. Quy ước tỷ lệ: 📄 1 trang = 500 token, 📖 1 cuốn sách = 500 trang, 📚 1 kệ sách = 500 cuốn.*

Với tất cả các thành phần hạ tầng này đã được thiết lập ổn định, chúng tôi có mọi thứ cần thiết để xây dựng FinePhrase: đúng prompts, đúng mô hình, và hạ tầng chạy thử nghiệm ở quy mô lớn.
