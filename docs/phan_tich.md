---
sidebar_position: 4
sidebar_label: '4. Phân tích'
---

# 🔍 Phân tích: Tại sao Diễn đạt lại hoạt động?

Các thí nghiệm cho biết cấu hình nào hoạt động hiệu quả. Giờ hãy cùng thu nhỏ góc nhìn để lý giải *tại sao*. Chúng tôi bắt đầu bằng việc kiểm chứng xem điểm số benchmark tăng lên có thực sự phản ánh năng lực thực tế hay chỉ là do rò rỉ dữ liệu (contamination), tiếp đó là phân tích chi phí tài nguyên, khả năng sử dụng các metric proxy giá rẻ thay thế cho huấn luyện thực tế, ảnh hưởng của quy mô mô hình học sinh (student), độ dài/cấu trúc của văn bản diễn đạt lại và bài học từ sự sụp đổ template của bài toán toán học.

---

### Diễn đạt lại có làm Rò rỉ Benchmark không?

Trước khi kết luận bất cứ điều gì từ điểm số benchmark, chúng ta phải loại trừ nguyên nhân tẻ nhạt nhất: mô hình đã nhìn thấy câu hỏi kiểm tra trong quá trình pretraining. Rephrasing làm dấy lên nghi ngờ này vì mô hình generator về mặt lý thuyết có thể sao chép các câu hỏi benchmark mà nó đã ghi nhớ trực tiếp vào corpus huấn luyện.

Do đó, chúng tôi đã thực hiện một cuộc audit đối với 56 corpus để tìm các đoạn trùng lặp (overlap) với các benchmark đánh giá: gồm 8 prompt định dạng rephrase bởi 6 generator quy mô nhỏ (1–1.7B tham số), cùng với các tập dữ liệu nguồn và baseline được so sánh:

> *Ghi chú phương pháp audit: Chúng tôi chạy một thuật toán audit trùng lặp 10-gram dựa trên bộ indexer khử trùng lặp của DataTrove. Chúng tôi băm (hash) mọi đoạn 10-gram từ câu trả lời của benchmark cùng với ranh giới câu hỏi/câu trả lời, sau đó quét từng corpus để tìm các kết quả khớp chuẩn hóa chính xác. Các đoạn n-gram chỉ chứa câu hỏi bị loại bỏ để tránh dương tính giả từ boilerplate template prompt (ví dụ: "Question: ... Answer:").*

<iframe src="/embeds/contamination-audit.html#data=contamination_audit_report.json" width="100%" height="600px" frameBorder="0"></iframe>

> *Hình 1: Mức độ trùng lặp benchmark trên 56 corpus được audit. Độ dài thanh hiển thị số lượng tài liệu trùng lặp trên mỗi một tỷ token. Kim cương tô đậm đại diện cho synthetic baseline, kim cương rỗng đại diện cho dữ liệu gốc tự nhiên.*

**Sự trùng lặp là không đáng kể, và quá trình rephrasing không tạo thêm trùng lặp mới.** Vì mỗi corpus được lấy mẫu về cùng một budget 5 tỷ token, chúng tôi so sánh số lượng tài liệu trùng lặp trên mỗi tỷ token thay vì tỷ lệ phần trăm theo tài liệu (để tránh thiên vị các tập dữ liệu có độ dài tài liệu trung bình lớn như DCLM).

Trên thước đo đó, các corpus rephrased trung bình có 726 tài liệu trùng lặp trên mỗi tỷ token, không cao hơn so với nguồn dữ liệu FineWeb-Edu-HQ gốc tạo ra chúng (841). Việc đẩy văn bản web qua một mô hình rephraser 1B không làm tăng thêm nội dung trùng lặp benchmark so với nguồn gốc. Ngoại lệ duy nhất là một baseline tự nhiên: REWIRE ở mức ~1,900, cao hơn hẳn mọi cấu hình khác. Các corpus sạch nhất cũng là baseline (Nemotron-HQ-Synth, SYNTH, và DCLM, đều dưới 370). Phân chia theo rephraser cho thấy mức độ chênh lệch rất nhỏ: Llama 3.2 làm rò rỉ nhiều nhất (864) và Falcon 3 ít nhất (625). Sự rò rỉ nhỏ nhoi này là không đáng kể để có thể giải thích cho các khoảng cách điểm số mà chúng tôi ghi nhận.

**Hầu hết sự trùng lặp nhỏ này chỉ tập trung vào một vài benchmark dễ đoán.** Hơn 4/5 số lượng trùng khớp rơi vào 3 tác vụ: MMLU-Redux (34%, hầu hết là các phần lịch sử và thống kê trung học), HellaSwag (30%), và WikiTableQuestions (20%). Đây đều là các tác vụ xây dựng từ các văn bản web được sao chép nhiều nơi (bảng Wikipedia, WikiHow, sách giáo khoa trực tuyến), nơi sự trùng hợp ngẫu nhiên là dễ xảy ra nhất. Các benchmark toán học và suy luận logic như GSM8K, DROP và WinoGrande gần như hoàn toàn sạch sẽ. Ở các mức độ này, sự rò rỉ không thể giải thích cho sự khác biệt hiệu suất.

---

### Đánh giá Mức độ Nhiễu của Seed (Seed Noise)

Mỗi so sánh trong nghiên cứu này đến từ một lượt chạy huấn luyện duy nhất. Để chắc chắn điểm số chênh lệch 1-2 điểm phần trăm không phải do ngẫu nhiên, chúng tôi cần xác định độ nhiễu cơ bản (noise floor) của quá trình huấn luyện.

Có hai nguồn ngẫu nhiên ảnh hưởng đến lượt huấn luyện: **seed khởi tạo mô hình** (model-initialization seed) và **seed thứ tự dữ liệu** (data-order seed — cách dataloader trộn và sắp xếp tài liệu). Chúng tôi đã chạy một ma trận 3x3 đầy đủ trên cả hai seed (tổng cộng 9 lượt chạy) từ đầu cho công thức hàng đầu của mình (FineWeb-Edu-HQ trộn 50/50 với prompt `table` rephrase bằng SmolLM2) và lặp lại ma trận này ở 4 quy mô mô hình học sinh (student) khác nhau, tổng cộng 72 lượt chạy huấn luyện từ đầu.

<iframe src="/embeds/seed-variance.html" width="100%" height="600px" frameBorder="0"></iframe>

> *Hình 2: Độ biến động run-to-run của công thức table trộn và baseline FineWeb-Edu-HQ trên ma trận 3x3 seed. Chọn các chế độ hiển thị bằng điều khiển View.*

**Ưu thế của dữ liệu tổng hợp vượt xa mức nhiễu ngẫu nhiên ở mọi quy mô.** Công thức hàng đầu của chúng tôi tái lặp với độ lệch chuẩn cực nhỏ chỉ từ 0.0016 đến 0.0020 điểm macro (hệ số biến thiên khoảng 1%) từ quy mô 0.5B đến 6.2B. Do đó, **khoảng cách ±0.002 điểm là ngưỡng nhiễu an toàn** giữa các lần chạy.

So với ngưỡng nhiễu đó, mức tăng hiệu suất mà công thức của chúng tôi mang lại (+0.047 đến +0.052) lớn gấp 14 đến 26 lần độ nhiễu ngẫu nhiên, quá lớn để có thể là do may mắn. Ngoài ra, baseline dữ liệu tự nhiên thô có mức độ nhiễu lớn hơn ở mọi quy mô (độ lệch chuẩn lớn hơn gấp 2.5 lần), cho thấy dữ liệu tổng hợp thực sự giúp quá trình huấn luyện mô hình trở nên **ổn định và dễ tái lặp hơn**. Biểu đồ phân tích nguồn biến động ("variance source") cũng chỉ ra rằng: hạt giống khởi tạo trọng số mô hình quyết định độ biến động nhiều hơn hẳn so với thứ tự sắp xếp dữ liệu.

Tuy nhiên, cần lưu ý hai điểm:
1. Ngưỡng nhiễu ±0.002 là điểm số *trung bình* (aggregate score). Trên từng benchmark riêng lẻ, độ nhiễu phân bố rất không đồng đều: rất thấp trên HellaSwag và PIQA (dưới 0.001) nhưng lại khá lớn trên DROP (khoảng 0.02). Vì vậy, khoảng cách 1 điểm phần trăm trên DROP có thể chỉ là nhiễu, nhưng trên HellaSwag lại là tín hiệu thực sự.
2. Việc pha trộn dữ liệu tổng hợp có xu hướng kìm hãm mức độ nhiễu hơn là làm tăng nó.

---

### Hiệu quả Chi phí Tài nguyên (Compute Efficiency)

Chạy 90 cấu hình rephrasing quy mô lớn tiêu tốn lượng GPU rất lớn. Thời gian GPU chênh lệch nhau tới hai bậc quy mô: lượt chạy rẻ nhất (prompt `table` với SmolLM2) chỉ mất 8 ngày GPU, trong khi lượt chạy đắt nhất (guided rewrite của REWIRE với Gemma-3 27B) tiêu tốn tới hơn 15 tháng GPU.

Dưới đây là biểu đồ trực quan hóa hiệu suất đánh giá so với chi phí GPU (thang log) của tất cả các thí nghiệm, với đường biên Pareto (Pareto frontier) kết nối các cấu hình tối ưu nhất:

<iframe src="/embeds/cost-efficiency.html" width="100%" height="600px" frameBorder="0"></iframe>

> *Hình 3: Thời gian sử dụng GPU (thang log) so với hiệu suất đánh giá của 90 cấu hình rephrase. Đường nét đứt biểu diễn biên tối ưu Pareto.*

**Đường biên tối ưu Pareto hoàn toàn bị thống trị bởi các mô hình nhỏ kết hợp với prompt đơn giản.** Tỷ lệ chi phí/hiệu năng tốt nhất đến từ các mô hình quy mô ~1B (Gemma-3-1B, SmolLM2-1.7B) kết hợp với các prompt định dạng cấu trúc rõ ràng như `math`, `table` và `faq`. Việc nâng quy mô lên các mô hình 12B hoặc 27B đẩy chi phí GPU lên gấp 5-10 lần nhưng thực tế lại làm *giảm* hiệu suất.

**Thông điệp rất rõ ràng: hãy đầu tư vào thiết kế prompt, chứ không phải quy mô mô hình generator.** Một prompt được thiết kế tốt chạy trên mô hình 1B sẽ đánh bại một prompt chung chung chạy trên mô hình 27B với chi phí chỉ bằng một phần nhỏ.

---

### Liệu có thể Bỏ qua Lượt chạy Huấn luyện và Đánh giá đắt đỏ?

Việc huấn luyện mô hình để kiểm tra mất rất nhiều thời gian. Liệu chúng ta có thể đánh giá trực tiếp chất lượng văn bản tổng hợp dựa trên các metric phân tích dữ liệu nhanh để dự đoán hiệu suất pretraining?

Chúng tôi thử nghiệm hai nhóm metric dự đoán:
1. **Bộ chấm điểm chất lượng (Quality classifiers):** DCLM-score và FineWeb-Edu-score.
2. **Metric đo độ đa dạng (Diversity metrics):** Đo lường mức độ đa dạng của các văn bản tổng hợp trong không gian ngữ nghĩa (semantic space bằng embedding của câu) hoặc trong không gian gradient (gradient space).

Chúng tôi tính toán tương quan hạng Spearman (Spearman rank correlation) giữa các metric dự đoán này với điểm số benchmark thực tế trên 83 thí nghiệm rephrase:

<iframe src="/embeds/score-correlation.html" width="100%" height="600px" frameBorder="0"></iframe>

> *Hình 4: Ma trận tương quan Spearman giữa các metric dự đoán và hiệu suất benchmark thực tế trên 83 thí nghiệm.*

#### Bộ chấm điểm chất lượng: Khả năng dự đoán ở mức trung bình
- **DCLM-score** là metric dự đoán tốt nhất cho hiệu suất tổng hợp (tương quan macro đạt ρ = 0.61, p &lt; 0.001). Mức độ thay đổi điểm số DCLM (sau rephrase trừ trước rephrase) có tương quan khá tốt với các tác vụ hiểu bảng biểu (ρ = 0.54) và đọc hiểu (ρ = 0.52).
- **Edu-score** cho kết quả phức tạp hơn. Điểm chất lượng giáo dục của dữ liệu nguồn ban đầu có tương quan dương nhẹ với hiệu suất (ρ = 0.27), nhưng điểm Edu-score của dữ liệu tổng hợp đầu ra hầu như không có tương quan (ρ = -0.08). Điểm số Edu-score đầu ra không phải là một công cụ dự đoán đáng tin cậy.

#### Metric đo độ đa dạng: G-Vendi chiếm ưu thế
- **Độ đa dạng ngữ nghĩa (Vendi Score trên embedding câu BGE):** Có tương quan thuận rõ rệt với các tác vụ hoàn thành câu như PIQA (ρ = 0.46) và HellaSwag (ρ = 0.36), nơi các cách diễn đạt đa dạng giúp mô hình làm quen với nhiều cấu trúc ngôn ngữ. Tuy nhiên, nó không có tương quan thuận đáng kể nào với điểm macro tổng thể.
- **Độ đa dạng không gian gradient (G-Vendi Score):** Được tính bằng cách lan truyền ngược (backpropagation) hàm mất mát cross-entropy của từng tài liệu qua một mô hình LLM proxy nhỏ đóng băng (Qwen3-0.6B) để trích xuất gradient, sau đó tính chỉ số Vendi Score trên tập hợp gradient đó.
  G-Vendi có tương quan thuận nhất quán với hầu hết các tác vụ đánh giá, bao gồm cả điểm macro tổng thể (ρ = 0.26, p &lt; 0.05) và micro (ρ = 0.29, p &lt; 0.01). Nó là metric dự đoán tốt nhất cho khả năng suy luận logic (ρ = 0.38).

**Tuy nhiên, các metric nhanh này không thể thay thế cho việc huấn luyện thực tế.** Ngay cả metric mạnh nhất cũng chỉ giải thích được khoảng 37% biến động hiệu suất, nhiều tác vụ như WinoGrande hoàn toàn không có tương quan với các metric này. Bạn chỉ nên dùng chúng để chọn lọc sơ bộ dữ liệu, chứ không thể bỏ qua lượt huấn luyện và đánh giá thực tế.

#### Điểm số chất lượng dịch chuyển thế nào qua quá trình Rephrase?

Biểu đồ slope chart dưới đây trực quan hóa sự dịch chuyển: mỗi thí nghiệm là một đường nối điểm số chất lượng đầu vào, điểm số chất lượng đầu ra, và hiệu suất đánh giá macro thực tế:

<iframe src="/embeds/score-shift.html" width="100%" height="600px" frameBorder="0"></iframe>

> *Hình 5: Biểu đồ slope chart thể hiện sự dịch chuyển điểm chất lượng qua quá trình rephrase. Chuyển đổi giữa góc nhìn DCLM và edu-score.*

- **Điểm số DCLM hầu như luôn tăng lên sau khi rephrase.** Mô hình generator viết lại văn bản theo cách sạch sẽ, mạch lạc hơn giúp tăng điểm số phân loại DCLM. Tuy nhiên, điểm số DCLM đầu ra cao không đảm bảo hiệu suất huấn luyện thực tế sẽ cao tương ứng.
- **Điểm số Edu-score lại có xu hướng giảm đi sau khi rephrase**, đặc biệt là đối với các dữ liệu nguồn chất lượng cao (vốn có điểm Edu gốc rất cao). Bộ phân loại Edu-score phạt nặng các định dạng thay đổi như bảng biểu, FAQ hay ký hiệu toán học mà các prompt tốt nhất của chúng tôi tạo ra. Đây là minh chứng cho thấy một metric proxy có thể đánh giá sai lệch: sự "sụt giảm chất lượng giáo dục" mà Edu-score ghi nhận thực chất lại là những chuyển đổi định dạng giúp **nâng cao hiệu suất huấn luyện thực tế**.

---

### Quy mô Mô hình Học sinh (Student Model) có quá nhỏ?

Trong thí nghiệm trước, chúng tôi thấy quy mô generator trên 1B không mang lại khác biệt lớn. Nhưng thí nghiệm đó chỉ dùng một mô hình học sinh 1.7B. Liệu có phải mô hình học sinh quá nhỏ nên không thể khai thác hết giá trị của dữ liệu từ các generator lớn?

Chúng tôi đã thử nghiệm huấn luyện các mô hình học sinh ở 4 quy mô khác nhau: 0.5B, 1.7B, 2.9B, và 6.2B:

<iframe src="/embeds/d3-student-scaling.html" width="100%" height="500px" frameBorder="0"></iframe>

> *Hình 6: Điểm số macro trung bình phân bổ theo quy mô mô hình học sinh và mô hình generator.*

**Mô hình học sinh nhỏ làm mờ đi sự khác biệt giữa các generator.** 
- Ở quy mô học sinh 0.5B, khoảng cách hiệu suất giữa các quy mô generator chỉ là 0.004 điểm macro.
- Khi nâng mô hình học sinh lên 2.9B, khoảng cách tăng lên 0.021 điểm và thể hiện rõ thứ tự xếp hạng: generator 270M kém nhất, 1B ở giữa, và các generator lớn (4B+) dẫn đầu.
- Nâng lên học sinh 6.2B không mở rộng thêm khoảng cách này mà chỉ làm thứ tự giữa các generator lớn trở nên nhiễu hơn.

**Mô hình học sinh 2.9B là điểm cân bằng lý tưởng (sweet spot)** để phân tách hiệu quả năng lực dữ liệu của các generator mà không chịu chi phí compute quá lớn của mức 6.2B.

Mô hình học sinh lớn hơn giúp khai thác tốt hơn chất lượng dữ liệu tổng hợp. Điểm macro trung bình tăng rõ rệt khi tăng quy mô học sinh. Tuy nhiên, **việc mở rộng quy mô mô hình học sinh mang lại hiệu quả lớn hơn nhiều so với việc mở rộng quy mô mô hình generator**. Nâng mô hình học sinh từ 1.7B lên 6.2B giúp tăng thêm +0.014 điểm macro. Trong khi đó, nâng generator từ 1B lên mức tốt nhất (4B+) chỉ mang lại mức tăng từ +0.004 đến +0.014 tùy thuộc vào prompt.

#### Chi tiết cho từng Prompt riêng lẻ

Sử dụng biểu đồ tương tác dưới đây để xem sự thay đổi hiệu suất của từng prompt ở các quy mô mô hình học sinh khác nhau:

<iframe src="/embeds/d3-benchmark-comparison.html#config=%7B%22setupDimension%22%3A%20%7B%22label%22%3A%20%22Student%22%2C%20%22groups%22%3A%20%7B%220.5B%22%3A%20%5B%22Guided%20rewrite%20%280.5B%29%22%2C%20%22Math%20%280.5B%29%22%2C%20%22Tutorial%20%280.5B%29%22%5D%2C%20%221.7B%22%3A%20%5B%22Guided%20rewrite%20%281.7B%29%22%2C%20%22Math%20%281.7B%29%22%2C%20%22Tutorial%20%281.7B%29%22%5D%2C%20%222.9B%22%3A%20%5B%22Guided%20rewrite%20%282.9B%29%22%2C%20%22Math%20%282.9B%29%22%2C%20%22Tutorial%20%282.9B%29%22%5D%2C%20%226.2B%22%3A%20%5B%22Guided%20rewrite%20%286.2B%29%22%2C%20%22Math%20%286.2B%29%22%2C%20%22Tutorial%20%286.2B%29%22%5D%7D%7D%2C%20%22setups%22%3A%20%7B%22Guided%20rewrite%20%280.5B%29%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-guided_rewrite_original_270m_hq-0.5b%22%3A%20%22Gemma-3%20270M%22%2C%20%22mix-fw_edu_hq-guided_rewrite_original_1b_hq-0.5b%22%3A%20%22Gemma-3%201B%22%2C%20%22mix-fw_edu_hq-guided_rewrite_original_4b_hq-0.5b%22%3A%20%22Gemma-3%204B%22%2C%20%22mix-fw_edu_hq-guided_rewrite_original_12b_hq-0.5b%22%3A%20%22Gemma-3%2012B%22%2C%20%22mix-fw_edu_hq-guided_rewrite_original_27b_hq-0.5b%22%3A%20%22Gemma-3%2027B%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%2C%20%22Guided%20rewrite%20%281.7B%29%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-guided_rewrite_original_270m_hq%22%3A%20%22Gemma-3%20270M%22%2C%20%22mix-fw_edu_hq-guided_rewrite_original_1b_hq%22%3A%20%22Gemma-3%201B%22%2C%20%22mix-fw_edu_hq-guided_rewrite_original_4b_hq%22%3A%20%22Gemma-3%204B%22%2C%20%22mix-fw_edu_hq-guided_rewrite_original_12b_hq%22%3A%20%22Gemma-3%2012B%22%2C%20%22mix-fw_edu_hq-guided_rewrite_original_27b_hq%22%3A%20%22Gemma-3%2027B%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%2C%20%22Guided%20rewrite%20%282.9B%29%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-guided_rewrite_original_270m_hq-2.9b%22%3A%20%22Gemma-3%20270M%22%2C%20%22mix-fw_edu_hq-guided_rewrite_original_1b_hq-2.9b%22%3A%20%22Gemma-3%201B%22%2C%20%22mix-fw_edu_hq-guided_rewrite_original_4b_hq-2.9b%22%3A%20%22Gemma-3%204B%22%2C%20%22mix-fw_edu_hq-guided_rewrite_original_12b_hq-2.9b%22%3A%20%22Gemma-3%2012B%22%2C%20%22mix-fw_edu_hq-guided_rewrite_original_27b_hq-2.9b%22%3A%20%22Gemma-3%2027B%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%2C%20%22Guided%20rewrite%20%286.2B%29%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-guided_rewrite_original_270m_hq-6.2b%22%3A%20%22Gemma-3%20270M%22%2C%20%22mix-fw_edu_hq-guided_rewrite_original_1b_hq-6.2b%22%3A%20%22Gemma-3%201B%22%2C%20%22mix-fw_edu_hq-guided_rewrite_original_4b_hq-6.2b%22%3A%20%22Gemma-3%204B%22%2C%20%22mix-fw_edu_hq-guided_rewrite_original_12b_hq-6.2b%22%3A%20%22Gemma-3%2012B%22%2C%20%22mix-fw_edu_hq-guided_rewrite_original_27b_hq-6.2b%22%3A%20%22Gemma-3%2027B%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%2C%20%22Math%20%280.5B%29%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-math_270m_hq-0.5b%22%3A%20%22Gemma-3%20270M%22%2C%20%22mix-fw_edu_hq-math_1b_hq-0.5b%22%3A%20%22Gemma-3%201B%22%2C%20%22mix-fw_edu_hq-math_4b_hq-0.5b%22%3A%20%22Gemma-3%204B%22%2C%20%22mix-fw_edu_hq-math_12b_hq-0.5b%22%3A%20%22Gemma-3%2012B%22%2C%20%22mix-fw_edu_hq-math_27b_hq-0.5b%22%3A%20%22Gemma-3%2027B%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%2C%20%22Math%20%281.7B%29%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-math_270m_hq%22%3A%20%22Gemma-3%20270M%22%2C%20%22mix-fw_edu_hq-math_1b_hq%22%3A%20%22Gemma-3%201B%22%2C%20%22mix-fw_edu_hq-math_4b_hq%22%3A%20%22Gemma-3%204B%22%2C%20%22mix-fw_edu_hq-math_12b_hq%22%3A%20%22Gemma-3%2012B%22%2C%20%22mix-fw_edu_hq-math_27b_hq%22%3A%20%22Gemma-3%2027B%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%2C%20%22Math%20%282.9B%29%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-math_270m_hq-2.9b%22%3A%20%22Gemma-3%20270M%22%2C%20%22mix-fw_edu_hq-math_1b_hq-2.9b%22%3A%20%22Gemma-3%201B%22%2C%20%22mix-fw_edu_hq-math_4b_hq-2.9b%22%3A%20%22Gemma-3%204B%22%2C%20%22mix-fw_edu_hq-math_12b_hq-2.9b%22%3A%20%22Gemma-3%2012B%22%2C%20%22mix-fw_edu_hq-math_27b_hq-2.9b%22%3A%20%22Gemma-3%2027B%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%2C%20%22Math%20%286.2B%29%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-math_270m_hq-6.2b%22%3A%20%22Gemma-3%20270M%22%2C%20%22mix-fw_edu_hq-math_1b_hq-6.2b%22%3A%20%22Gemma-3%201B%22%2C%20%22mix-fw_edu_hq-math_4b_hq-6.2b%22%3A%20%22Gemma-3%204B%22%2C%20%22mix-fw_edu_hq-math_12b_hq-6.2b%22%3A%20%22Gemma-3%2012B%22%2C%20%22mix-fw_edu_hq-math_27b_hq-6.2b%22%3A%20%22Gemma-3%2027B%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%2C%20%22Tutorial%20%280.5B%29%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-tutorial_270m_hq-0.5b%22%3A%20%22Gemma-3%20270M%22%2C%20%22mix-fw_edu_hq-tutorial_1b_hq-0.5b%22%3A%20%22Gemma-3%201B%22%2C%20%22mix-fw_edu_hq-tutorial_4b_hq-0.5b%22%3A%20%22Gemma-3%204B%22%2C%20%22mix-fw_edu_hq-tutorial_12b_hq-0.5b%22%3A%20%22Gemma-3%2012B%22%2C%20%22mix-fw_edu_hq-tutorial_27b_hq-0.5b%22%3A%20%22Gemma-3%2027B%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%2C%20%22Tutorial%20%281.7B%29%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-tutorial_270m_hq%22%3A%20%22Gemma-3%20270M%22%2C%20%22mix-fw_edu_hq-tutorial_1b_hq%22%3A%20%22Gemma-3%201B%22%2C%20%22mix-fw_edu_hq-tutorial_4b_hq%22%3A%20%22Gemma-3%204B%22%2C%20%22mix-fw_edu_hq-tutorial_12b_hq%22%3A%20%22Gemma-3%2012B%22%2C%20%22mix-fw_edu_hq-tutorial_27b_hq%22%3A%20%22Gemma-3%2027B%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%2C%20%22Tutorial%20%282.9B%29%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-tutorial_270m_hq-2.9b%22%3A%20%22Gemma-3%20270M%22%2C%20%22mix-fw_edu_hq-tutorial_1b_hq-2.9b%22%3A%20%22Gemma-3%201B%22%2C%20%22mix-fw_edu_hq-tutorial_4b_hq-2.9b%22%3A%20%22Gemma-3%204B%22%2C%20%22mix-fw_edu_hq-tutorial_12b_hq-2.9b%22%3A%20%22Gemma-3%2012B%22%2C%20%22mix-fw_edu_hq-tutorial_27b_hq-2.9b%22%3A%20%22Gemma-3%2027B%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%2C%20%22Tutorial%20%286.2B%29%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-tutorial_270m_hq-6.2b%22%3A%20%22Gemma-3%20270M%22%2C%20%22mix-fw_edu_hq-tutorial_1b_hq-6.2b%22%3A%20%22Gemma-3%201B%22%2C%20%22mix-fw_edu_hq-tutorial_4b_hq-6.2b%22%3A%20%22Gemma-3%204B%22%2C%20%22mix-fw_edu_hq-tutorial_12b_hq-6.2b%22%3A%20%22Gemma-3%2012B%22%2C%20%22mix-fw_edu_hq-tutorial_27b_hq-6.2b%22%3A%20%22Gemma-3%2027B%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%7D%7D" width="100%" height="600px" frameBorder="0"></iframe>

> *Hình 7: Quét Gemma-3 generator ở các quy mô mô hình học sinh khác nhau.*

---

### Sự Dông dài (Verbosity) của Mô hình có Giúp ích không?

Các định dạng prompt khác nhau tạo ra độ dài văn bản khác nhau. Prompt `table` và `math` thường ngắn gọn, trong khi `faq` và `tutorial` dài hơn hẳn.

<iframe src="/embeds/verbosity.html" width="100%" height="600px" frameBorder="0"></iframe>

> *Hình 8: Số lượng token đầu ra của mỗi tài liệu trên các loại prompt và họ mô hình generator.*

Nhưng liệu độ dài văn bản này có ảnh hưởng đến hiệu suất pretraining không? Tỷ lệ nén dữ liệu (token đầu ra chia cho token đầu vào) của các prompt dao động từ cực ngắn (0.26x ở Commentary) đến rất dài (1.5x ở Guided Rewrite). Hãy quan sát tương quan giữa tỷ lệ nén và điểm số benchmark thực tế:

<iframe src="/embeds/compression-performance.html" width="100%" height="600px" frameBorder="0"></iframe>

> *Hình 9: Tỷ lệ nén (tokens đầu ra / đầu vào) so với hiệu suất pretraining.*

**Không có mối quan hệ đáng kể nào giữa tỷ lệ nén và hiệu suất pretraining.** Các prompt nén rất mạnh (Commentary, Table) và các prompt kéo dài văn bản (Guided Rewrite) xuất hiện rải rác trên toàn bộ phổ điểm số. Điều thực sự quyết định chất lượng là **cấu trúc và nội dung thông tin**, chứ không phải độ dài văn bản.

---

### Rephrase Toán học: Khi Bản dịch "Tệ hơn" lại Chiến thắng

Đây là một trong những phát hiện bất ngờ nhất của chúng tôi. Chúng tôi so sánh dữ liệu bài toán toán học được tạo ra bởi hai mô hình ~1.7B tham số: SmolLM2 và Qwen3. Dữ liệu từ Qwen3 trông đẹp mắt, chính xác và có cấu trúc hoàn hảo, trong khi SmolLM2 tạo ra văn bản lộn xộn hơn nhiều. Tuy nhiên, mô hình học sinh huấn luyện trên dữ liệu SmolLM2 lại đạt điểm số benchmark cao hơn hẳn.

**Qwen3 tạo ra các bài toán cấu trúc rất đẹp:**
- 99.7% có đầy đủ phần Problem/Solution riêng biệt.
- 98.9% định dạng các bước giải rõ ràng.
- 59% sử dụng ký hiệu LaTeX tiêu chuẩn.

*Một ví dụ điển hình của Qwen3:*
```
**Problem:**
A disc rotates at 120 rpm. How many revolutions in 5 minutes?

**Solution:**
1. Revolutions per minute = 120
2. Number of minutes = 5
3. Total revolutions = 120 × 5

$$120 \times 5 = 600$$

The disc makes 600 revolutions in 5 minutes.
```

**SmolLM2 lộn xộn hơn rất nhiều:**
- Chỉ 68.8% có lời giải hoàn chỉnh.
- Độ dài đầu ra dao động cực lớn (từ 1 đến 3540 token).
- Định dạng hỗn độn: nhiều bài viết chỉ có câu hỏi, lời giải dở dang, hoặc trích xuất linh tinh.

Tuy nhiên, mô hình huấn luyện trên SmolLM2 lại giành chiến thắng. Chúng tôi phát hiện ra thủ phạm chính là **hiện tượng sụp đổ template (template collapse)** ở Qwen3: Qwen3 tuân thủ chỉ dẫn quá tốt đến mức các tài liệu của nó *quá giống nhau*.

Biểu đồ dưới đây thể hiện mức độ trùng lặp tiền tố (prefix) trên 10,000 tài liệu ngẫu nhiên của hai mô hình:

<iframe src="/embeds/d3-prefix-collapse.html#data=qwen3_vs_smollm2_prefix_collapse.csv" width="100%" height="600px" frameBorder="0"></iframe>

> *Hình 10: Đường cong sụp đổ tiền tố ở các độ dài ký tự khác nhau của hai mô hình.*

Các con số thực sự gây sốc: ở 10 ký tự đầu tiên, Qwen3 chỉ có **40 loại tiền tố độc nhất** (trong đó 7,619 tài liệu bắt đầu bằng tiền tố phổ biến nhất là `'**Problem:'`), trong khi SmolLM2 có tới **1,897 tiền tố độc nhất**. Qwen3 bị sụp đổ khuôn mẫu dữ liệu một cách trầm trọng.

Phân tích sâu hơn về mặt nội dung toán học:

| Phân loại chất lượng | Tiêu chí | Tỷ lệ của SmolLM2 |
| :--- | :--- | :--- |
| **Xuất sắc** | Đầy đủ Solution + cấu trúc các bước + trên 80 token | 44.6% |
| **Tốt** | Có Solution + trên 50 token | 22.7% |
| **Một phần** | Trên 30 token nhưng thiếu cấu trúc rõ ràng | 24.1% |
| **Kém** | Dưới 30 token | 8.6% |

#### Dữ liệu có thực sự chứa Toán học không?

Chúng tôi chạy một công cụ phân tích tự động để kiểm tra tính chính xác của các phép toán trên 10,000 tài liệu của mỗi mô hình:

<iframe src="/embeds/math-adherence-audit.html#data=math_format_adherence.csv" width="100%" height="600px" frameBorder="0"></iframe>

> *Hình 11: Bảng kết quả audit tính chính xác và tuân thủ định dạng toán học trên 10,000 tài liệu.*

Ba kết luận quan trọng rút ra:
1. **Gần 1/4 dữ liệu rephrase toán học của SmolLM2 hoàn toàn không chứa con số nào** (23.0%), thường sinh ra các bài toán ngụy biện không liên quan (ví dụ: viết bài toán về cách chủ nuôi chó phòng ngừa cháy nắng cho thú cưng bằng chữ thuần túy). Tỷ lệ này ở Qwen3 chỉ là 0.1%.
2. **Định dạng đẹp mắt không đi kèm với tính toán chính xác.** Tỷ lệ tính toán số học đúng của Qwen3 đạt 78.9% (5072/6432 phép tính chính xác), trong khi SmolLM2 chỉ đạt 57.3% (1385/2418).
3. **Mô hình bám sát dữ liệu nguồn nhất thực tế là Gemma 3**, chứ không phải Qwen3 hay SmolLM2. Qwen3 và Llama 3.2 dù có định dạng toán học rất đẹp mắt và mật độ thuật ngữ toán học rất cao, nhưng lại đứng cuối bảng về độ bám sát dữ liệu nguồn.

Tổng hợp lại: **Qwen3 tạo ra dữ liệu chứa toán học hợp lệ cao gấp 4 lần SmolLM2 (30.2% vs 8.1%), nhưng mô hình pretrain trên dữ liệu SmolLM2 vẫn chiến thắng.**

Điều này cho thấy: trong giai đoạn pretraining, tín hiệu mà mô hình thu nhận và học được nhiều nhất từ dữ liệu tổng hợp không phải là sự chính xác tuyệt đối của từng phương trình số học đơn lẻ, mà là **sự đa dạng phong phú về định dạng và chủ đề ngữ nghĩa** mà mô hình generator mang lại. Một mô hình generator phá vỡ khuôn mẫu template lặp lại sẽ mang lại giá trị huấn luyện pretraining tốt hơn hẳn, ngay cả khi nó tạo ra các đầu ra lộn xộn hoặc lệch đề tài.

---

> [!NOTE]
> **Tóm tắt các Điểm Phân tích Cốt lõi**
> - **Chi phí:** Các mô hình 1B kết hợp prompt cấu trúc đơn giản thống trị biên hiệu quả Pareto. Đầu tư vào prompt, tránh lãng phí compute vào Generator quy mô lớn.
> - **Metric proxy nhanh:** DCLM-score hay Edu-score không dự đoán đáng tin cậy hiệu suất pretrain của dữ liệu tổng hợp. Không thể bỏ qua bước huấn luyện-đánh giá thực tế.
> - **Quy mô mô hình học sinh:** Mô hình học sinh 2.9B là sweet-spot giúp phân tách rõ rệt chất lượng dữ liệu của generator. Việc mở rộng mô hình học sinh mang lại hiệu quả lớn hơn hẳn việc nâng quy mô generator.
> - **Độ dài văn bản:** Không có mối quan hệ nhân quả nào với hiệu suất. Cấu trúc thông tin mới là yếu tố quyết định.
> - **Template sụp đổ (Template collapse):** Là tác nhân phá hủy giá trị huấn luyện pretraining lớn nhất. Một generator tạo ra tiền tố đa dạng sẽ chiến thắng generator bị đóng khung template, ngay cả khi generator đa dạng kia có đầu ra lộn xộn và nhiều lỗi tính toán hơn.
