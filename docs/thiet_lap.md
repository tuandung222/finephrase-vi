---
sidebar_position: 2
sidebar_label: '2. Thiết lập'
---

# ⚙️ Thiết lập: Diễn đạt lại mạng Web

Một vài đội ngũ nghiên cứu đã chứng minh rằng việc diễn đạt lại (rephrasing) nội dung web thành các định dạng sạch hơn có thể mang lại kết quả tốt hơn so với việc huấn luyện trực tiếp trên dữ liệu thô:
- Nghiên cứu WRAP [1] viết lại văn bản theo nhiều phong cách khác nhau.
- Nemotron-CC [2] trích xuất các cặp câu hỏi-đáp (QA) và danh sách kiến thức.
- REWIRE [3] thực hiện viết lại theo hướng dẫn (guided rewriting).
- BeyondWeb [4] thử nghiệm phương pháp viết tiếp (continuation) và tóm tắt (summarization).
- EntiGraph [5] sử dụng phương pháp tăng cường dựa trên thực thể để tổng hợp các biểu diễn kiến thức đa dạng từ các corpus nhỏ.

Tuy nhiên, trước đây chưa từng có một nghiên cứu so sánh hệ thống nào giữa các phương pháp này, và lĩnh vực này vẫn thiếu một khung định nghĩa rõ ràng cho khái niệm "diễn đạt lại" (rephrasing). Hãy cùng làm rõ điều này.

### Diễn đạt lại (Rephrasing) là gì?

**Rephrasing** hiểu đơn giản là đưa các tài liệu hiện có qua một mô hình ngôn ngữ để tạo ra các biến thể mới — giữ nguyên nội dung nhưng thay đổi cách trình bày. Nghe thì có vẻ đơn giản, nhưng không gian thiết kế của nó vô cùng rộng lớn. Một tài liệu có thể được viết lại thành một bài hướng dẫn (tutorial) kèm ví dụ chi tiết, tái cấu trúc thành một cuộc thảo luận FAQ, mở rộng thêm phần bình luận giải thích, cô đọng thành danh sách kiến thức hoặc viết lại theo phong cách Wikipedia.

Mỗi cách chuyển đổi lại nhắm vào các khả năng khác nhau của mô hình: các bài hướng dẫn có thể giúp tăng khả năng suy luận từng bước (step-by-step reasoning), FAQ giúp cải thiện khả năng trả lời câu hỏi, và các công thức toán học được viết lại có thể củng cố tư duy định lượng. Vậy những cách chuyển đổi nào thực sự hiệu quả và trong trường hợp nào? Đó chính là điều chúng tôi muốn trả lời.

### Ba Trục của Dữ liệu Tổng hợp

Chúng tôi tư duy về việc tạo dữ liệu tổng hợp dọc theo ba trục chính, mỗi trục tương ứng với một câu hỏi:

1. **Chiến lược rephrasing (Rephrasing strategy):** Những cách chuyển đổi nào thực sự cải thiện hiệu suất của mô hình ở giai đoạn sau? Chúng tôi so sánh các prompt từ các nghiên cứu trước (guided rewriting của REWIRE, trích xuất QA và kiến thức của Nemotron) với các định dạng mới (tutorial, FAQ, bảng biểu, công thức toán học).
2. **Mô hình tạo dữ liệu (Generator model):** Các đặc tính của mô hình ảnh hưởng thế nào đến chất lượng rephrase? Chúng tôi thử nghiệm trên nhiều họ mô hình (Gemma, Llama, Qwen, Granite, Falcon, SmolLM), các thế hệ mô hình (từ Qwen 1.5 đến Qwen 3) và các quy mô tham số khác nhau (từ 270M đến 27B).
3. **Chất lượng dữ liệu gốc (Source data quality):** Khi nào chất lượng của dữ liệu nguồn thực sự quan trọng? Chúng tôi tiến hành rephrase trên cả nguồn dữ liệu chất lượng cao (FineWeb-Edu-HQ, DCLM) và chất lượng thấp (FineWeb-Edu-LQ, Cosmopedia) để kiểm tra xem việc diễn đạt lại có giúp phục hồi giá trị từ các tài liệu nhiễu hay chỉ làm phóng đại thêm sự chênh lệch chất lượng vốn có.

Các nghiên cứu trước đây thường khám phá các khía cạnh này một cách riêng lẻ. Tuy nhiên, sự giao thoa giữa chúng mới là nơi chứa đựng những câu hỏi thú vị nhất. Liệu chiến lược tốt nhất có phụ thuộc vào chất lượng dữ liệu nguồn không? Các mô hình nhỏ có thể rephrase dữ liệu chất lượng cao một cách hiệu quả không, hay bạn cần các mô hình lớn hơn để "cứu vớt" các tài liệu nhiễu? Và một câu hỏi xuyên suốt cả ba trục: **dữ liệu tổng hợp và dữ liệu gốc tương tác với nhau như thế nào?** Chúng tôi so sánh việc huấn luyện chỉ dùng dữ liệu tổng hợp với việc trộn dữ liệu tổng hợp và dữ liệu gốc, thử nghiệm các tỷ lệ trộn khác nhau và kiểm tra xem việc kết hợp nhiều prompt hoặc họ mô hình có tạo ra đủ sự đa dạng để thay thế hoàn toàn dữ liệu gốc hay không. Dưới đây là cách chúng tôi thiết lập pipeline để kiểm chứng tất cả những điều này.

### Quy trình chạy Rephrasing của chúng tôi

Trong thực tế, chúng tôi thực hiện rephrase các tài liệu bằng cách sử dụng các mô hình instruction-tuned có quy mô từ 270M đến 27B tham số (chủ yếu là các biến thể Gemma-3) trên các corpus web đã qua lọc bao gồm FineWeb-Edu và DCLM, xử lý khoảng 20 tỷ token đầu vào cho mỗi phân khúc chất lượng. Pipeline của chúng tôi chạy các tài liệu thông qua các template prompt tùy chỉnh để biến văn bản web thô thành các cấu trúc định dạng rõ ràng (bài viết, hướng dẫn, FAQ, thảo luận, bình luận) cũng như các nhiệm vụ chưng cất (distillation) và viết tiếp (continuation) lấy cảm hứng từ các nghiên cứu trước.

Để chạy inference (suy luận), chúng tôi sử dụng vLLM với tensor parallelism (song song hóa tensor), chunked prefill, và speculative decoding (suy luận suy đoán — sử dụng n-gram prompt lookup với khoảng 7 draft token, tỷ lệ chấp nhận khoảng 0.7). Mỗi tài liệu sau khi rephrase đều được chấm điểm bởi cả classifier FineWeb-Edu và công cụ đánh giá chất lượng DCLM. Chúng tôi cũng theo dõi số lượng token, mức độ thay đổi điểm chất lượng và metadata bao gồm cả vết suy nghĩ (thinking traces) nếu có.

Toàn bộ quy trình được chạy phân tán trên 100 tác vụ song song trên cụm SLURM có cơ chế checkpointing, hướng tới mục tiêu tạo ra 10 tỷ token dữ liệu tổng hợp phục vụ cho các thử nghiệm huấn luyện. Chi tiết hơn về hạ tầng sẽ được trình bày ở phần sau.

### Các tập dữ liệu nguồn (Seed Datasets)

Trước khi đi sâu vào các thí nghiệm, dưới đây là tổng quan nhanh về các tập dữ liệu mà chúng tôi so sánh. Chúng tôi dùng thuật ngữ "dữ liệu nguồn" (source data) và "dữ liệu hạt giống" (seed data) thay thế cho nhau.

#### Nhóm Dữ liệu Tinh tuyển (Curated)
- **DCLM [6]:** Một benchmark tiêu chuẩn cung cấp corpus gồm 240T token từ Common Crawl với cơ chế lọc dựa trên mô hình làm chiến lược tinh tuyển cốt lõi. DCLM cho phép huấn luyện một mô hình 7B đạt 64% trên MMLU với 2.6T token.
- **FineWeb-Edu-HQ / LQ [7]:** Các tập con của FineWeb-Edu, tập dữ liệu giáo dục 1.3T token được lọc bằng Llama-3-70B-Instruct chấm điểm từ 0 đến 5. Chúng tôi sử dụng HQ (điểm 4 hoặc 5) và LQ (điểm 0 hoặc 1) để nghiên cứu ảnh hưởng của chất lượng dữ liệu nguồn.
- **Ultra-FineWeb [8]:** Tập dữ liệu gồm 1T token tiếng Anh và 120B token tiếng Trung được tạo ra bằng cách áp dụng bộ lọc dựa trên xác thực hiệu quả vào FineWeb. Sử dụng classifier fastText nhẹ và tối ưu hóa việc lựa chọn dữ liệu nguồn.

#### Nhóm Dữ liệu Tổng hợp (Synthetic)
- **Nemotron-HQ-Synth [2]:** Thuộc tập dữ liệu Nemotron-CC 6.3T token sử dụng cơ chế ensemble classifier và rephrase dữ liệu tổng hợp. Tập con HQ-Synth chứa dữ liệu được rephrase bằng Qwen3-30B-A3B.
- **Cosmopedia [9]:** Tập dữ liệu tổng hợp gồm 30 triệu file với 25 tỷ token được tạo ra bởi Mixtral-8x7B-Instruct, chứa sách giáo khoa, bài viết blog và truyện kể. Được tạo ra thông qua kỹ thuật prompt tinh tế dựa trên các nguồn giáo dục tinh tuyển và các cụm dữ liệu web.
- **SYNTH [10]:** Tập dữ liệu hoàn toàn tổng hợp xây dựng từ 50,000 bài viết Wikipedia được mở rộng thành các bài toán và lời giải, bao gồm bài tập toán, viết sáng tạo và trích xuất thông tin.
- **REWIRE [3]:** Phương pháp tái chế web bằng cách viết lại có hướng dẫn nhằm làm giàu các tài liệu chất lượng thấp bị loại bỏ bởi các pipeline lọc. Trộn văn bản thô chất lượng cao với văn bản viết lại giúp cải thiện từ 1.0 đến 2.5 điểm phần trăm ở các quy mô mô hình 1B, 3B và 7B trên 22 tác vụ đánh giá.

### Cách chúng tôi Đo lường Thành công

Để đánh giá từng cấu hình, chúng tôi tuân theo phương pháp đánh giá (ablation) từ FineWeb: huấn luyện một mô hình ngôn ngữ 1.7B tham số với kiến trúc kiểu Qwen2 (chi tiết trong phần [Phụ lục](phu_luc.md)) trên 20 tỷ token và đánh giá trên 12 benchmark thuộc sáu danh mục sử dụng prompt 3-shot với một seed duy nhất:

> *Ghi chú: Một seed duy nhất là hoàn toàn đủ ở đây: một nghiên cứu riêng biệt về độ biến động của seed (seed-variance study) cho thấy độ nhiễu giữa các lần chạy chỉ khoảng ±0.002 điểm số tổng hợp (hệ số biến thiên khoảng 1%), nhỏ hơn nhiều so với khoảng cách hiệu suất mà chúng tôi so sánh. Chúng tôi cũng sử dụng định dạng cloze (cloze format - CF) cho hầu hết các tác vụ thay vì trắc nghiệm tiêu chuẩn, vì CF định hình việc đánh giá như một bài toán dự đoán token tiếp theo, mang lại tín hiệu đáng tin cậy hơn cho các mô hình nhỏ vốn có thể gặp khó khăn trong việc tuân thủ chỉ dẫn hoặc định dạng trắc nghiệm.*

- **Kiến thức tổng quát (General Knowledge):** ARC, MMLU Redux
- **Đọc hiểu (Reading Comprehension):** SQuAD v2, DROP
- **Suy luận (Reasoning):** OpenBookQA, XCSQA
- **Hiểu ngôn ngữ tự nhiên (Natural Language Understanding):** WinoGrande, PIQA, HellaSwag
- **Toán học (Math):** GSM8K
- **Hiểu bảng biểu (Table Understanding):** WikiTableQuestions, TriviaQA

Sau khi đã làm rõ tất cả các bối cảnh thiết lập, hãy cùng bước vào phần thú vị nhất: các thí nghiệm.

---

### Tài liệu tham khảo
- [1] WRAP paper: Richer Commonsense Knowledge Acquisition.
- [2] Nemotron-CC paper: Scalable Web Data Curation.
- [3] REWIRE paper: Recycling Web Data with Guided Rewriting.
- [4] BeyondWeb paper: Continuation and Summarization for Data Quality.
- [5] EntiGraph paper: Entity-Centric Augmentation for Knowledge Representation.
- [6] DataComp-LM (DCLM) paper.
- [7] FineWeb technical report.
- [8] Ultra-FineWeb project.
- [9] Cosmopedia project page.
- [10] SYNTH project.
