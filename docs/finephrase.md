---
sidebar_position: 6
sidebar_label: '6. FinePhrase'
---

# 🛠️ Xây dựng FinePhrase

Khi các thí nghiệm đã hoàn tất và hạ tầng đã được thử nghiệm thực tế qua các đợt chạy thử, đã đến lúc chúng tôi tổng hợp mọi thứ lại với nhau. Chúng tôi áp dụng các phát hiện của mình để xây dựng [FinePhrase](https://huggingface.co/datasets/HuggingFaceFW/finephrase), một tập dữ liệu tổng hợp quy mô lớn diễn đạt lại 339 triệu tài liệu từ [FineWeb-Edu](https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu) (phần sample-350BT) thành bốn định dạng cấu trúc khác nhau, tạo ra 1,35 tỷ mẫu và 486 tỷ token đầu ra (completion tokens) cho dữ liệu tiền huấn luyện (pretraining) tổng hợp.

Công thức của FinePhrase tự rút ra một cách rõ ràng từ các kết quả thí nghiệm: chọn mô hình tốt nhất (SmolLM2-1.7B-Instruct), các prompt tốt nhất (FAQ, Toán học, Bảng cấu trúc, Bài hướng dẫn), các thiết lập suy luận tối ưu từ các đợt quét benchmark hiệu năng, và hạ tầng DataTrove. Chúng tôi khởi chạy 100 tác vụ Slurm song song, mỗi tác vụ chạy trên một GPU H100 đơn lẻ với giải mã suy đoán suffix-32. Hệ thống được chạy trong khoảng hai tuần bằng cách tận dụng tài nguyên tính toán nhàn rỗi (spare compute) trên cụm máy tính của chúng tôi.

Để bạn dễ hình dung về quy mô: Các benchmark hạ tầng của chúng tôi cho thấy SmolLM2-1.7B-Instruct đạt hiệu năng ~9.200 token trên giây trên mỗi GPU khi bật giải mã suy đoán suffix-32. Với 100 GPU chạy song song, hiệu năng tổng đạt ~920.000 token trên giây, tương đương khoảng 3,3 tỷ token mỗi giờ. Diễn đạt lại ~339 triệu tài liệu bốn lần (một lần cho mỗi prompt) với độ dài trung bình ~359 token mỗi mẫu đồng nghĩa với việc sinh ra khoảng 486 tỷ token. Ở tốc độ này, quá trình sinh dữ liệu tiêu tốn khoảng 612 ngày GPU (GPU-days), tương đương khoảng 6 ngày thời gian thực (wall-clock days) với 100 GPU (trên thực tế là gần hai tuần nếu tính cả thời gian khởi động lại, các worker bị lỗi, và sự tranh chấp tài nguyên trên cụm Slurm).

### Công thức chi tiết (The Recipe)

Mọi lựa chọn cấu hình đều bắt nguồn trực tiếp từ các phát hiện trong thí nghiệm hoặc benchmark hạ tầng của chúng tôi:

- **Mô hình**: [SmolLM2-1.7B-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct), mô hình vượt trội hoàn toàn so với tất cả các họ mô hình khác trên mọi prompt trong phần [So sánh các họ mô hình](/docs/thi_nghiem#họ-mô-hình-có-quan-trọng-không).
- **Prompt**: [FAQ](/docs/phu_luc#faq), [Toán học (Math)](/docs/phu_luc#math), [Bảng cấu trúc (Table)](/docs/phu_luc#table), và [Bài hướng dẫn (Tutorial)](/docs/phu_luc#tutorial) — bốn prompt [liên tục vượt qua DCLM](/docs/thi_nghiem#liệu-các-prompt-mới-có-thể-đánh-bại-dclm) trong các thí nghiệm của chúng tôi.
- **Dữ liệu nguồn**: [FineWeb-Edu sample-350BT](https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu), bởi các thí nghiệm của chúng tôi đã chứng minh rằng [chất lượng tập dữ liệu nguồn là yếu tố thứ yếu](/docs/thi_nghiem#tác-động-của-việc-lựa-chọn-tập-dữ-liệu) khi được kết hợp với một tập dữ liệu mix-in mạnh mẽ.
- **Cấu hình suy luận**: tp=1 với giải mã suy đoán suffix-32, mns=2048, mnbt=16384, gmu=0,90 — tất cả được đúc kết từ [thử nghiệm benchmark hiệu năng](/docs/ha_tang#đánh-giá-hiệu-năng-xử-lý-throughput-benchmarking) giúp tăng tốc 1,75 lần cho SmolLM2-1.7B-Instruct.

Toàn bộ quá trình chạy production của FinePhrase được định nghĩa trong [một script duy nhất](https://github.com/huggingface/datatrove/blob/main/examples/inference/finephrase.py) được tối giản hóa tối đa. Nó chỉ khai báo cấu hình và gọi script [`generate_data`](https://github.com/huggingface/datatrove/blob/main/examples/inference/generate_data.py) đã giới thiệu trong phần [Hạ tầng](/docs/ha_tang) (cùng một script chúng tôi dùng cho tất cả các benchmark throughput). Dưới đây là cấu hình cốt lõi:

```python
KWARGS = {
    "model_name_or_path": "HuggingFaceTB/SmolLM2-1.7B-Instruct",
    "model_max_context": 8192,
    "max_tokens": 2048,
    "input_dataset_name": "HuggingFaceFW/fineweb-edu",
    "input_dataset_config": "sample-350BT",
    "output_dataset_name": "HuggingFaceFW/finephrase",
    "max_num_seqs": 2048,
    "max_num_batched_tokens": 16384,
    "gpu_memory_utilization": 0.90,
    "speculative_config": '{"method":"suffix","num_speculative_tokens":32}',
    "enable_monitoring": True,
    "examples_per_chunk": 100_000,
    "workers": 100,
    "tasks": 100,
}

PROMPT_TEMPLATES = {
    "math": "Rewrite the document to create a mathematical word problem ...",
    "table": "Rewrite the document as a structured table ...",
    "faq": "Rewrite the document as a comprehensive FAQ ...",
    "tutorial": "Rewrite the document as a clear, step-by-step tutorial ...",
}

for name, template in PROMPT_TEMPLATES.items():
    generate_data_main(**KWARGS, name=f"finephrase_{name}",
                       prompt_template=[name, template])
```

> [!NOTE]
> 📝 **Ghi chú**
> Chúng tôi đặt `max_tokens=2048` thay vì 4096 vì SmolLM2-1.7B-Instruct hiếm khi sinh ra quá 2K token cho mỗi tài liệu. Việc giảm một nửa giới hạn token này giúp vLLM phân bổ thêm bộ nhớ đệm KV cache cho các chuỗi chạy song song.

Mọi khía cạnh vận hành phức tạp đều được xử lý gọn gàng trong bản thân thư viện DataTrove: xử lý chia nhỏ dữ liệu với tính năng khôi phục dựa trên checkpoint, thực thi Slurm phân tán, tải dữ liệu lên Hub theo chu kỳ, và tự động tạo thẻ tập dữ liệu (dataset card). Script [`generate_data`](https://github.com/huggingface/datatrove/blob/main/examples/inference/generate_data.py) liên kết các thành phần này thành một giao diện dòng lệnh (CLI) duy nhất để sinh dữ liệu tổng hợp, đó là lý do tại sao script production của FinePhrase chỉ dài chưa đầy 100 dòng code. Trước khi tiêu tốn bất kỳ giờ GPU nào, hệ thống sẽ thực hiện các bước kiểm tra tiền khả thi (pre-flight checks): `check_hf_auth()` xác thực bạn có token có quyền ghi (write token), `ensure_repo_exists()` tạo kho chứa dữ liệu đầu ra, và `validate_config()` phát hiện các thiết lập song song không hợp lệ đồng thời xác nhận các prompt template chứa đúng thẻ đại diện `[[DOCUMENT]]`. Hệ thống cũng đọc cấu hình sinh dữ liệu `GenerationConfig` của mô hình từ Hub để kế thừa các tham số lấy mẫu mặc định thay vì yêu cầu bạn phải cấu hình thủ công trong code. Hàm rollout tự động cắt ngắn các tài liệu vượt quá giới hạn ngữ cảnh tại các ranh giới xuống dòng, một tính năng cực kỳ quan trọng khi xử lý 339 triệu tài liệu, nơi chắc chắn sẽ có một số tài liệu quá dài.

Trên Slurm, một lệnh gọi `generate_data` duy nhất điều phối ba job hoạt động nhịp nhàng: job suy luận (100 worker song song thực hiện sinh dữ liệu thực tế), job giám sát (cập nhật dataset card với thanh tiến độ và thời gian hoàn thành dự kiến), và job tạo thẻ tập dữ liệu (tính toán các số liệu thống kê cuối cùng sau khi hoàn thành). Trình giám sát theo dõi ID của job suy luận và sẽ tự động dừng nếu job suy luận thất bại. Job tạo thẻ tập dữ liệu sử dụng ràng buộc dependency `afterok` của Slurm để chỉ chạy khi các job trước hoàn thành thành công. Khi các job đã chạy, thách thức tiếp theo là theo dõi tiến độ và tự động đưa kết quả lên Hub.

### Tự động tải lên Hub và theo dõi tiến độ

Chúng tôi muốn bạn có thể chỉ cần nhấn nút khởi chạy, để các GPU hoạt động hết công suất, và quay lại kiểm tra khi tập dữ liệu đã hoàn thành. DataTrove liên tục tải dữ liệu lên kho chứa Hugging Face bất cứ khi nào một chunk dữ liệu hoàn thành, sử dụng `ParquetWriter` với các đường dẫn `hf://` giúp dữ liệu xuất hiện trên Hub chỉ vài phút sau khi sinh, thay vì phải đợi toàn bộ quá trình chạy kết thúc. Cuối cùng, bước `InferenceDatasetCardGenerator` trong pipeline sẽ kiểm tra thư mục log, thu thập thông tin về hiệu năng xử lý (throughput) và tải lên thẻ tập dữ liệu để tài liệu hóa tập dữ liệu tổng hợp mới của bạn. Dưới đây là ví dụ về thẻ tập dữ liệu tự động được sinh ra:

<figure id="auto-dataset-card">
  <img src="/img/finephrase/auto-dataset-card.png" alt="Auto-generated dataset card on the Hugging Face Hub" />
  <figcaption>Ví dụ về thẻ tập dữ liệu (dataset card) tự động được gán thông số hiệu năng sinh dữ liệu, được tải lên Hugging Face Hub sau khi hoàn thành suy luận.</figcaption>
</figure>

Đối với các job suy luận chạy dài như FinePhrase (chạy trong khoảng hai tuần), trình giám sát tiến độ `InferenceProgressMonitor` chạy như một job Slurm độc lập bên cạnh các worker suy luận. Nó định kỳ quét thư mục đầu ra, đếm các chunk đã hoàn thành trên toàn bộ 100 tác vụ, và cập nhật dataset card trên Hub với thanh tiến độ và thời gian hoàn thành dự kiến (ETA) cho mỗi template prompt. Dưới đây là bảng giám sát tiến độ trực tiếp trong quá trình chạy FinePhrase:

<figure id="finephrase-progress">
  <img src="/img/finephrase/finephrase-progress.png" alt="Live progress monitoring of the FinePhrase generation run" />
  <figcaption>Bảng theo dõi tiến độ trực tiếp của quá trình sinh FinePhrase, hiển thị trạng thái hoàn thành trên từng prompt, số lượng tài liệu đã sinh, và thời gian hoàn thành dự kiến (ETA). Trình theo dõi chạy dưới dạng một job Slurm độc lập và cập nhật dataset card theo chu kỳ mỗi giờ.</figcaption>
</figure>

Cả trình giám sát tiến độ và trình tạo thẻ tập dữ liệu đều được cấu hình thông qua một đối tượng `InferenceDatasetCardParams` để thu thập đầy đủ siêu dữ liệu (metadata) của lượt chạy. Script `generate_data` tự động tạo các pipeline này, dưới đây là cách thức hoạt động bên dưới hệ thống:

```python
params = InferenceDatasetCardParams(
    output_repo_id="HuggingFaceFW/finephrase",
    input_dataset_name="HuggingFaceFW/fineweb-edu",
    input_dataset_split="train",
    model_name="HuggingFaceTB/SmolLM2-1.7B-Instruct",
    # ... các tham số khác
)

monitor_pipeline = [
    InferenceProgressMonitor(
        params=params, update_interval=3600
    )
]

datacard_pipeline = [
    InferenceDatasetCardGenerator(params=params)
]
```

Đó là kịch bản lý tưởng khi mọi thứ diễn ra suôn sẻ. Nhưng việc chạy 100 worker song song trong hai tuần cũng làm phát sinh rất nhiều vấn đề nghiêm trọng ngoài ý muốn.

### Các cải tiến đóng góp cho DataTrove

Xây dựng FinePhrase không đơn thuần là chạy suy luận ở quy mô lớn. Việc xử lý 339 triệu tài liệu trên 100 worker song song trong hai tuần sẽ thử thách sức chịu đựng của hạ tầng theo cách mà các thí nghiệm nhỏ không bao giờ chạm tới. Mọi lỗi có thể tưởng tượng được đều đã xảy ra: tài liệu lỗi làm sập mô hình, các worker tranh chấp ghi đè lên cùng một repo, các job Slurm bị sập ngay khi khởi động, và cache bị hỏng do xung đột truy cập. Chúng tôi đã đóng góp hơn một chục pull request (PR) để giải quyết các vấn đề này. Dưới đây là những PR có tác động lớn nhất.

#### Xử lý lỗi mượt mà cho tài liệu lỗi (Graceful error handling)

Ở quy mô 339 triệu tài liệu, việc có một số tài liệu gây lỗi là điều không thể tránh khỏi: tài liệu quá dài so với cửa sổ ngữ cảnh ngay cả sau khi cắt ngắn, nội dung sai định dạng tạo ra các token lỗi, hoặc các trường hợp đặc biệt (edge cases) trong tokenizer. Trước khi có [PR #450](https://github.com/huggingface/datatrove/pull/450), chỉ một tài liệu lỗi duy nhất cũng có thể làm sập toàn bộ worker, khiến toàn bộ tiến trình của tác vụ đó bị mất. Tùy chọn `skip_bad_requests` cho phép `InferenceRunner` bắt các ngoại lệ `BadRequestError` từ phía nhà cung cấp dịch vụ, ghi nhận lại tài liệu gây lỗi, và tiếp tục xử lý phần còn lại của chunk dữ liệu.

```python
InferenceRunner(
    rollout_fn=simple_rollout,
    config=inference_config,
    skip_bad_requests=True,  # Ghi log và bỏ qua thay vì làm sập chương trình
)
```

#### Khôi phục nhanh nhờ bỏ qua các phần đã checkpoint (Fast Resume)

Phiên bản đầu tiên của `skip_bad_requests` gặp phải một vấn đề nhỏ: các tài liệu bị bỏ qua không được ghi lại trong checkpoint. Điều này khiến các chunk chứa tài liệu lỗi không bao giờ đạt trạng thái hoàn thành, `last_chunk` không được cập nhật tiến trình, và mỗi lần khởi động lại hệ thống phải quét lại toàn bộ lịch sử checkpoint từ đầu. Với FinePhrase có quy mô 100.000 tài liệu mỗi chunk, điều này khiến quá trình khởi động lại cực kỳ chậm (đôi khi lãng phí hàng giờ chạy GPU của mỗi worker). [PR #464](https://github.com/huggingface/datatrove/pull/464) đã khắc phục lỗi này bằng cách ghi các tài liệu bị bỏ qua vào checkpoint với một đánh dấu đặc biệt để chúng được tính là đã hoàn thành nhưng loại trừ khỏi kết quả đầu ra cuối cùng. PR này cũng tăng tốc độ khôi phục bằng cách sắp xếp các tệp checkpoint và bỏ qua việc phát lại (replay) cho các chunk đã hoàn thành.

#### Tăng độ bền bỉ khi tải lên Hub trước các lỗi tạm thời

Với 100 worker ghi đồng thời vào cùng một repository trên Hugging Face Hub, các lỗi kết nối tạm thời không còn là khả năng mà là điều chắc chắn xảy ra. Chúng tôi đã gặp phải ba loại lỗi khác nhau và đã khắc phục từng lỗi:

- **Tranh chấp Commit** ([PR #448](https://github.com/huggingface/datatrove/pull/448)): Hai worker thực hiện commit đồng thời và một worker nhận lỗi `412 Precondition Failed` với nội dung "A commit has happened since". Giải pháp là bổ sung logic thử lại (retry) với thuật toán giãn cách lũy thừa (exponential backoff) vào `DiskWriter`, lớp nền tảng xử lý mọi tác vụ ghi lên Hub.
- **Lỗi server tạm thời** ([PR #463](https://github.com/huggingface/datatrove/pull/463)): Các lỗi như `503 Service Unavailable` và các lỗi API tạm thời khác trước đây không được thử lại một cách nhất quán. PR này chuẩn hóa logic thử lại trên cả `DiskWriter` và `HuggingFaceDatasetWriter` để tất cả các lỗi tạm thời được xử lý đồng bộ.
- **Lỗi xác thực LFS** ([PR #455](https://github.com/huggingface/datatrove/pull/455)): Các tệp lớn thỉnh thoảng gặp lỗi xác thực LFS phía server khi tải lên. Một chỉnh sửa ngắn đã thêm chuỗi `"lfs-verify"` vào danh sách các thông báo lỗi có thể thử lại.

#### Cô lập cache Xet cho từng tác vụ Slurm

Hugging Face Hub sử dụng [Xet](https://huggingface.co/docs/hub/storage-backends#xet-storage-backend) làm backend lưu trữ, và bộ nhớ đệm (cache) cục bộ của nó không được thiết kế cho việc truy cập đồng thời từ 100 tiến trình song song. Việc chia sẻ cache dẫn đến lỗi hỏng dữ liệu và sập tiến trình. [PR #465](https://github.com/huggingface/datatrove/pull/465) cấp cho mỗi tác vụ Slurm một thư mục cache riêng biệt được phân tách bằng ID của job, tác vụ, và tiến trình:

```bash
export HF_XET_CACHE="/tmp/hf_xet/${SLURM_JOB_ID}_${SLURM_ARRAY_TASK_ID}_${SLURM_PROCID}"
mkdir -p "$HF_XET_CACHE"
```

#### Hỗ trợ tập dữ liệu đa cấu hình (Multi-config)

FinePhrase chạy bốn template prompt tạo ra bốn cấu hình tập dữ liệu độc lập (faq, math, table, tutorial). Nếu không phân tách cấu hình, bốn template này sẽ tranh giành ghi đè lên cùng một dataset card và bộ đếm tiến trình sẽ vượt quá 100%. [PR #447](https://github.com/huggingface/datatrove/pull/447) bổ sung tính năng phân tách cấu hình ở mức cốt lõi: kết quả đầu ra được đưa vào các thư mục riêng cho từng cấu hình (ví dụ: `hf://datasets/HuggingFaceFW/finephrase/faq/`, `.../math/`, v.v.), dataset card tổng hợp thông tin từ tất cả cấu hình, và trình giám sát theo dõi độc lập từng cấu hình để hiển thị bốn thanh tiến độ riêng biệt (như trong [bảng giám sát tiến độ ở trên](#tự-động-tải-lên-hub-và-theo-dõi-tiến-độ)).

#### Tùy biến thời gian khởi động server

Thời gian khởi động của vLLM server biến động rất lớn tùy thuộc vào kích thước mô hình, mức độ tối ưu hóa, và tải trọng của cụm tính toán. Ở mức `optimization_level=3` (thiết lập throughput cao nhất), vLLM biên dịch CUDA graphs trong khi khởi động, quá trình này có thể mất vài phút. Thời gian chờ khởi động (startup timeout) cố định trước đây sẽ giết chết các job khỏe mạnh chỉ vì chúng khởi tạo chậm. [PR #451](https://github.com/huggingface/datatrove/pull/451) cho phép tùy biến mọi tham số khởi động thông qua `InferenceConfig`: timeout, số lần thử tối đa, độ trễ thử lại, và số lần thử lại tối đa.

#### Sửa lỗi CPU binding trên SLURM

Một chỉnh sửa nhỏ nhưng nếu thiếu nó thì không job nào chạy được. Chính sách CPU binding mặc định của Slurm xung đột với cách DataTrove khởi chạy vLLM server, đôi khi khiến job thất bại ngay lập tức với lỗi `srun: error: CPU binding outside of job step allocation`. [PR #457](https://github.com/huggingface/datatrove/pull/457) chuyển đối số `--cpu-bind=none` sang lệnh srun để vô hiệu hóa chính sách binding hạn chế này.

```python
SlurmPipelineExecutor(
    srun_args={"cpu-bind": "none"},
    ...
)
```

Với tất cả các chỉnh sửa này, pipeline đã chạy hoàn tất và ổn định. Vậy tập dữ liệu thu được thực tế trông như thế nào?

### Có gì trong tập dữ liệu?

Hãy cùng duyệt qua một số ví dụ thực tế từ FinePhrase bên dưới. Mỗi ví dụ hiển thị tài liệu nguồn FineWeb-Edu gốc cùng với cả bốn phiên bản diễn đạt lại. Bạn có thể duyệt qua các ví dụ để xem cách cùng một tài liệu web được biến đổi thành một FAQ, một bài toán toán học, một bảng dữ liệu cấu trúc, và một bài hướng dẫn từng bước:

<iframe src="/embeds/finephrase-explorer.html" width="100%" height="600px" frameBorder="0"></iframe>

> *Hình 6.2: Trực quan hóa các tài liệu thực tế từ tập dữ liệu FinePhrase. Mỗi mẫu hiển thị tài liệu nguồn FineWeb-Edu gốc cùng với bốn phiên bản diễn đạt lại (FAQ, Toán học, Bảng cấu trúc, Bài hướng dẫn). Sử dụng các nút mũi tên hoặc nút "Random" để chuyển giữa các mẫu.*

### So sánh hiệu quả của FinePhrase

Trong phần giới thiệu, chúng tôi đã hé lộ cấu hình tối ưu nhất của mình: prompt bảng cấu trúc (table prompt) được trộn ở tỷ lệ 70% dữ liệu tổng hợp. Giờ đây khi toàn bộ tập dữ liệu đã được xây dựng hoàn chỉnh, dưới đây là so sánh hiệu quả của cả bốn prompt FinePhrase với các baseline dữ liệu tổng hợp mạnh nhất, mỗi loại được trộn với FineWeb-Edu-HQ ở tỷ lệ tối ưu nhất của riêng nó thông qua đợt quét [tỷ lệ trộn dữ liệu tổng hợp](/docs/thi_nghiem#cần-trộn-bao-nhiêu-dữ-liệu-tổng-hợp):

<iframe src="/embeds/d3-benchmark-comparison.html#config=%7B%22defaultView%22%3A%20%22line%22%2C%20%22datasets%22%3A%20%7B%22mix-0.3-fw_edu_hq-0.7-table_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%22FinePhrase%20%28table%29%22%2C%20%22color%22%3A%20%22%23EBA937%22%7D%2C%20%22mix-0.2-fw_edu_hq-0.8-math_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%22FinePhrase%20%28math%29%22%2C%20%22color%22%3A%20%22%23E09530%22%7D%2C%20%22mix-0.4-fw_edu_hq-0.6-faq_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%22FinePhrase%20%28faq%29%22%2C%20%22color%22%3A%20%22%23D58228%22%7D%2C%20%22mix-0.4-fw_edu_hq-0.6-tutorial_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%22FinePhrase%20%28tutorial%29%22%2C%20%22color%22%3A%20%22%23CA7020%22%7D%2C%20%22cosmopedia%22%3A%20%7B%22display%22%3A%20%22Cosmopedia%22%2C%20%22color%22%3A%20%22%23e15759%22%7D%2C%20%22nemotron_hq_synth%22%3A%20%7B%22display%22%3A%20%22Nemotron-HQ-Synth%22%2C%20%22color%22%3A%20%22%2376b900%22%7D%2C%20%22rewire%22%3A%20%7B%22display%22%3A%20%22REWIRE%22%2C%20%22color%22%3A%20%22%231877F2%22%7D%2C%20%22synth_query_reasoning_answer%22%3A%20%7B%22display%22%3A%20%22SYNTH%22%2C%20%22color%22%3A%20%22%23b07aa1%22%7D%7D%7D" width="100%" height="600px" frameBorder="0"></iframe>

> *Hình 6.3: Cả bốn cấu hình prompt của FinePhrase, mỗi cấu hình ở tỷ lệ trộn tối ưu nhất, được so sánh với các baseline dữ liệu tổng hợp khác trên các thước đo đánh giá hiệu năng.*

Cả bốn prompt của FinePhrase đều vượt trội hơn mọi baseline dữ liệu tổng hợp với khoảng cách rõ rệt. Prompt bảng cấu trúc (table) và toán học (math) dẫn đầu nhóm, theo sau sát nút là FAQ và bài hướng dẫn (tutorial). Biểu đồ phân tích chi tiết từng benchmark (có thể chuyển đổi bằng menu thả xuống ở trên) kể lại một câu chuyện quen thuộc: các prompt FinePhrase chiếm ưu thế tuyệt đối trên ARC, SQuAD, và DROP (kiến thức và đọc hiểu), trong khi các baseline giữ một chút lợi thế trên HellaSwag và PIQA (commonsense - hiểu biết thông thường). Đây chính là sự đánh đổi giữa hiểu biết thông thường và kiến thức mà chúng tôi quan sát được trong suốt quá trình thí nghiệm, và đó chính xác là lý do tại sao FinePhrase được thiết kế để trộn với dữ liệu gốc thay vì sử dụng độc lập. Điểm số tổng hợp (aggregate) tăng lên vì mức tăng trưởng về mặt kiến thức bù đắp vượt trội so với mức hao hụt về hiểu biết thông thường.

Điều làm cho kết quả này trở nên thuyết phục hơn nữa là hiệu quả tối ưu về mặt chi phí. Dưới đây là so sánh FinePhrase với các dự án sinh dữ liệu tổng hợp lớn khác:

<figure id="cost-efficiency">

| Tập dữ liệu | Mô hình sinh dữ liệu | Số token | Số giờ GPU (H100) | Token / Giờ GPU |
| :--- | :--- | ---: | ---: | ---: |
| Cosmopedia | Mixtral 8x7B | 25B | &gt; 10K | &lt; 2.5M |
| SYNTH | Mô hình tinh chỉnh riêng | 80B | 4K | 20M |
| REWIRE | Llama-3.3 70B | 400B | **~352K** | ~1.1M |
| Nemotron-CC | Mistral NeMo 12B | **1,9T** | n/a | n/a |
| **FinePhrase** | SmolLM2-1.7B | 486B | ~14,7K | **~33,1M** |

<figcaption>So sánh chi phí tính toán giữa các dự án sinh dữ liệu tổng hợp. Tất cả giờ GPU đều được quy đổi về GPU H100. Số giờ của REWIRE được ngoại suy từ thông số 88K giờ cho mỗi 100 tỷ token của họ. Dự án Nemotron-CC không công bố chi phí sinh dữ liệu.</figcaption>
</figure>

FinePhrase đạt hiệu suất **~33 triệu token trên mỗi giờ GPU**, hiệu quả gấp khoảng 30 lần so với REWIRE và hơn 13 lần so với Cosmopedia. Nó tạo ra lượng token lớn hơn REWIRE trong khi sử dụng lượng compute ít hơn 24 lần, nhờ vào sự kết hợp tối ưu giữa mô hình 1.7B (so với 70B), các thiết lập suy luận tối ưu, và giải mã suy đoán. Kết luận rút ra là: Bạn không cần các mô hình khổng lồ để sinh dữ liệu tổng hợp chất lượng cao.

Đó là bức tranh toàn cảnh: 333 thí nghiệm huấn luyện-và-đánh giá trên 90 cấu hình diễn đạt lại, một hạ tầng vững chắc đã qua thực chiến, và 486 tỷ token dữ liệu tổng hợp được mở rộng công khai. Hãy cùng kết lại với những gì chúng tôi học được và hướng đi tiếp theo.
