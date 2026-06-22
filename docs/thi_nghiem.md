---
sidebar_position: 3
sidebar_label: '3. Thí nghiệm'
---

# 🧪 Thí nghiệm: Khám phá Không gian Diễn đạt lại (Rephrasing Space)

Đã đến lúc đưa tất cả các giả thuyết vào kiểm chứng thực tế. Chúng tôi đã tạo ra 90 cấu hình rephrasing, sau đó thực hiện 333 thí nghiệm huấn luyện-và-đánh giá để trả lời một cách hệ thống cho các câu hỏi của mình. Hành trình này đã mang lại một số bất ngờ thú vị ngoài dự kiến. Dưới đây là bức tranh toàn cảnh về không gian rephrasing mà chúng tôi đã khám phá, từ các tập dữ liệu nguồn, qua các chiến lược prompt, cho đến các họ mô hình:

<iframe src="/embeds/experiment-overview.html#data=rephrasing_metadata.json" width="100%" height="600px" frameBorder="0"></iframe>

> *Hình 1: Dòng chảy thí nghiệm từ các tập dữ liệu nguồn qua các chiến lược prompt đến các họ mô hình tạo dữ liệu. Rê chuột qua các node và link để xem số lượng thí nghiệm.*

Chúng tôi bắt đầu bằng việc so sánh các tập dữ liệu mở hiện có, sau đó phân tích các yếu tố cốt lõi giúp prompt của chúng hoạt động tốt. Từ đó, chúng tôi thiết kế các prompt mới của riêng mình, khám phá xem mô hình tạo dữ liệu ảnh hưởng thế nào đến chất lượng và nghiên cứu sự tương tác giữa dữ liệu tổng hợp và dữ liệu gốc. Trên chặng đường này, chúng tôi cũng tình cờ phát hiện ra một số phát hiện đáng ngạc nhiên về các lỗi chính tả (typo) và hiện tượng sụp đổ template (template collapse). Mỗi phần chính sẽ kết thúc bằng một hộp tóm tắt các điểm rút ra quan trọng.

---

### So sánh các Tập dữ liệu Hiện có

Trước hết: tiêu chuẩn chất lượng hiện tại nằm ở đâu? Chúng tôi thiết lập các baseline bằng cách huấn luyện mô hình trên 8 tập dữ liệu phổ biến dưới các điều kiện giống hệt nhau và so sánh hiệu suất đánh giá của chúng:

<iframe src="/embeds/d3-benchmark-comparison.html#config=%7B%22datasets%22%3A%20%7B%22cosmopedia%22%3A%20%22Cosmopedia%22%2C%20%22dclm%22%3A%20%22DCLM%22%2C%20%22fw_edu_hq%22%3A%20%22FineWeb-Edu-HQ%22%2C%20%22fw_edu_lq%22%3A%20%22FineWeb-Edu-LQ%22%2C%20%22nemotron_hq_synth%22%3A%20%22Nemotron-HQ-Synth%22%2C%20%22rewire%22%3A%20%22REWIRE%22%2C%20%22synth_query_reasoning_answer%22%3A%20%22SYNTH%22%2C%20%22ultra-fineweb%22%3A%20%22Ultra-FineWeb%22%7D%7D" width="100%" height="600px" frameBorder="0"></iframe>

> *Hình 2: So sánh các tập dữ liệu baseline trên các metric đánh giá khác nhau. Dùng menu dropdown để chuyển đổi các metric.*

Kết quả cho thấy DCLM, Nemotron-HQ-Synth và REWIRE vượt trội rõ rệt. Các tập dữ liệu còn lại, bao gồm Cosmopedia, FineWeb-Edu (cả HQ và LQ), Ultra-FineWeb và SYNTH, tụt lại phía sau khá xa. DCLM là baseline mạnh nhất và trở thành mục tiêu cần vượt qua của chúng tôi trong tất cả các thí nghiệm tiếp theo.

Vì Nemotron-HQ-Synth và REWIRE đều là sự kết hợp của nhiều prompt khác nhau, câu hỏi đặt ra là: thành phần nào thực sự đóng vai trò quyết định trong việc mang lại hiệu suất cao cho chúng?

#### Prompt Đơn lẻ nào đạt Hiệu suất Tương đương DCLM?

Chúng tôi tách riêng từng prompt từ Nemotron-HQ-Synth ([diverse_qa_pairs](/docs/phu_luc#diverse_qa_pairs), [extract_knowledge](/docs/phu_luc#extract_knowledge), [distill](/docs/phu_luc#distill), [wikipedia_style_rephrasing](/docs/phu_luc#wikipedia_style_rephrasing), [knowledge_list](/docs/phu_luc#knowledge_list)), prompt [guided_rewrite](/docs/phu_luc#guided_rewrite_original) của REWIRE, và hai prompt baseline từ BeyondWeb ([continue](/docs/phu_luc#continue), [summarize](/docs/phu_luc#summarize)). Tất cả đều sử dụng Gemma-3-1B trên nguồn dữ liệu FineWeb-Edu-HQ:

> *Ghi chú: Tập dữ liệu BeyondWeb chưa từng được công bố và bài báo của họ đã bỏ qua nhiều chi tiết quan trọng dù tuyên bố đạt hiệu suất rất cao. Chúng tôi đã thử nghiệm các prompt continue và summarize của họ để kiểm chứng các tuyên bố này và công bố rộng rãi kết quả cho cộng đồng.*

<iframe src="/embeds/d3-benchmark-comparison.html#config=%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-diverse_qa_pairs_1b_hq%22%3A%20%7B%22display%22%3A%20%22Diverse%20QA%20Pairs%22%2C%20%22color%22%3A%20%22%23c5e384%22%7D%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%2C%20%22mix-fw_edu_hq-extract_knowledge_1b_hq%22%3A%20%7B%22display%22%3A%20%22Extract%20Knowledge%22%2C%20%22color%22%3A%20%22%233d6b00%22%7D%2C%20%22mix-fw_edu_hq-guided_rewrite_original_1b_hq%22%3A%20%7B%22display%22%3A%20%22Guided%20Rewrite%22%2C%20%22color%22%3A%20%22%236aabff%22%7D%2C%20%22nemotron_hq_synth%22%3A%20%7B%22display%22%3A%20%22Nemotron-HQ-Synth%22%2C%20%22color%22%3A%20%22%2376b900%22%2C%20%22shaded%22%3A%20true%7D%2C%20%22rewire%22%3A%20%7B%22display%22%3A%20%22REWIRE%22%2C%20%22color%22%3A%20%22%231877F2%22%2C%20%22shaded%22%3A%20true%7D%2C%20%22mix-fw_edu_hq-distill_1b_hq%22%3A%20%7B%22display%22%3A%20%22Distill%22%2C%20%22color%22%3A%20%22%23a0c95c%22%7D%2C%20%22mix-fw_edu_hq-wikipedia_style_rephrasing_1b_hq%22%3A%20%7B%22display%22%3A%20%22Wikipedia%20Rephrasing%22%2C%20%22color%22%3A%20%22%237fb034%22%7D%2C%20%22mix-fw_edu_hq-knowledge_list_1b_hq%22%3A%20%7B%22display%22%3A%20%22Knowledge%20List%22%2C%20%22color%22%3A%20%22%235e960e%22%7D%2C%20%22mix-fw_edu_hq-continue_1b_hq%22%3A%20%7B%22display%22%3A%20%22Continue%22%2C%20%22color%22%3A%20%22%23e8713a%22%7D%2C%20%22mix-fw_edu_hq-summarize_1b_hq%22%3A%20%7B%22display%22%3A%20%22Summarize%22%2C%20%22color%22%3A%20%22%23c4451c%22%7D%7D%7D" width="100%" height="600px" frameBorder="0"></iframe>

> *Hình 3: Hiệu suất của từng prompt đơn lẻ từ các tập dữ liệu tổng hợp hiện có so với baseline DCLM.*

Nhìn chung, chỉ có `diverse_qa_pairs` và prompt `guided_rewrite` của REWIRE đạt điểm số ngang ngửa DCLM. Các prompt continue và summarize từ BeyondWeb không chạm tới mức của DCLM. Như vậy, trong số tất cả các prompt từ các nghiên cứu trước, chỉ có hai prompt thực sự bắt kịp baseline của chúng tôi. Đó là một tỷ lệ thành công khá khiêm tốn.

Tuy nhiên, điểm số trung bình (aggregate score) đã che giấu một quy luật rất rõ rệt. Hãy chuyển sang các benchmark riêng lẻ bằng menu dropdown, bạn sẽ thấy DCLM áp đảo trên HellaSwag và PIQA (suy luận thông thường — commonsense reasoning), đánh bại mọi prompt dữ liệu tổng hợp đơn lẻ. Trong khi đó, hầu hết các prompt tổng hợp lại dễ dàng đánh bại DCLM trên ARC (kiến thức khoa học) và SQuAD (đọc hiểu).

Việc diễn đạt lại (rephrasing) về bản chất là một quá trình **trao đổi khả năng suy luận thông thường lấy khả năng nhớ thông tin thực tế**. Điểm số trung bình đã làm mờ đi điều này vì phần tăng ở khía cạnh này bù trừ cho phần giảm ở khía cạnh kia. Hãy lưu ý sự đánh đổi này khi đọc tiếp: nó giải thích tại sao việc trộn dữ liệu gốc lại quan trọng, tại sao DCLM là tập dữ liệu trộn tốt nhất, và tại sao việc huấn luyện chỉ dùng dữ liệu tổng hợp lại có hiệu suất kém hơn.

Liệu chúng tôi có thể làm tốt hơn với các prompt do tự mình thiết kế?

---

### Liệu các Prompt mới có thể đánh bại DCLM?

Vì hầu hết các prompt hiện có không vượt qua được DCLM, chúng tôi đã thiết kế 9 định dạng prompt mới nhắm vào các kỹ năng khác nhau (`article`, `commentary`, `discussion`, `explanation`, `faq`, `math`, `narrative`, `table`, `tutorial`), tất cả đều sử dụng Gemma-3-1B trên nguồn FineWeb-Edu-HQ:

<iframe src="/embeds/d3-benchmark-comparison.html#config=%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-article_1b_hq%22%3A%20%22Article%22%2C%20%22mix-fw_edu_hq-commentary_1b_hq%22%3A%20%22Commentary%22%2C%20%22mix-fw_edu_hq-discussion_1b_hq%22%3A%20%22Discussion%22%2C%20%22mix-fw_edu_hq-explanation_1b_hq%22%3A%20%22Explanation%22%2C%20%22mix-fw_edu_hq-faq_1b_hq%22%3A%20%22FAQ%22%2C%20%22mix-fw_edu_hq-math_1b_hq%22%3A%20%22Math%22%2C%20%22mix-fw_edu_hq-narrative_1b_hq%22%3A%20%22Narrative%22%2C%20%22mix-fw_edu_hq-table_1b_hq%22%3A%20%22Table%22%2C%20%22mix-fw_edu_hq-tutorial_1b_hq%22%3A%20%22Tutorial%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D" width="100%" height="600px" frameBorder="0"></iframe>

> *Hình 4: Chín prompt mới so với baseline DCLM.*

Bốn trong số đó (`faq`, `math`, `table`, `tutorial`) đã vượt trội rõ rệt so với DCLM, trong khi 5 prompt còn lại chỉ ngang bằng hoặc kém hơn. Các prompt chiến thắng đều có một đặc điểm chung: chúng tái cấu trúc nội dung nguồn thành các **định dạng giàu tính sư phạm** chứ không chỉ đơn thuần là paraphrase (diễn đạt lại bằng từ ngữ khác).

Sự đánh đổi giữa khả năng suy luận thông thường và kiến thức thực tế ở phần trước vẫn xuất hiện ở đây: khi chuyển sang HellaSwag hoặc PIQA, mọi prompt đơn lẻ (kể cả 4 prompt chiến thắng) đều rơi xuống dưới mức của DCLM. Các prompt mới chiến thắng trên điểm số tổng hợp là nhờ điểm số tăng vọt ở ARC và SQuAD đã bù đắp cho sự sụt giảm ở phần suy luận thông thường, chứ không phải vì chúng cải thiện đồng đều ở mọi kỹ năng.

Mỗi prompt cũng có một dấu ấn benchmark rất riêng biệt:
- `table` mang lại mức tăng ARC mạnh nhất (+7.5pp so với DCLM).
- `math` là prompt duy nhất thực sự cải thiện đáng kể GSM8K (+1.5pp, các prompt khác chỉ dao động trong khoảng ±0.5pp) và cũng tăng SQuAD nhiều nhất (+11.2pp).
- `tutorial` là prompt duy nhất cải thiện nhẹ DROP (+1.4pp, mặc dù mức này nằm trong khoảng nhiễu của DROP nên chúng tôi không quá nhấn mạnh).

Khả năng kháng cự của GSM8K cho thấy: suy luận toán học thực sự đòi hỏi nội dung chuyên biệt về toán học, chứ không chỉ đơn thuần là việc tái cấu trúc sư phạm thông thường.

Cho đến nay chúng tôi vẫn sử dụng Gemma-3-1B cho mọi thí nghiệm. Một câu hỏi tự nhiên là: liệu chúng tôi có thể đạt hiệu suất tốt hơn bằng cách sử dụng các mô hình lớn hơn hoặc tốt hơn để rephrase dữ liệu?

---

### Tác động của Mô hình Diễn đạt lại (Generator)

Chúng tôi xem xét khía cạnh này từ ba góc độ: quy mô mô hình, họ mô hình và thế hệ mô hình.

#### Quy mô Mô hình có Quan trọng không?

Chúng tôi so sánh các quy mô của Gemma-3 (270M, 1B, 4B, 12B, 27B) trên các prompt `math`, `tutorial`, và `guided_rewrite` của REWIRE. Sử dụng dropdown Setup để chuyển đổi giữa các thí nghiệm:

> *Ghi chú: Có khả năng các mô hình lớn hơn tạo ra các bản rephrasings phong phú hoặc tinh tế hơn mà bộ benchmark của chúng tôi chưa nắm bắt được. Đánh giá của chúng tôi đo lường một nhóm kỹ năng cố định, nên các cải thiện tinh tế về chất lượng dữ liệu có thể chưa được phát hiện ra.*

<iframe src="/embeds/d3-benchmark-comparison.html#config=%7B%22setups%22%3A%20%7B%22Gemma-3%3A%20Math%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-math_27b_hq%22%3A%20%22Gemma-3%2027B%22%2C%20%22mix-fw_edu_hq-math_12b_hq%22%3A%20%22Gemma-3%2012B%22%2C%20%22mix-fw_edu_hq-math_4b_hq%22%3A%20%22Gemma-3%204B%22%2C%20%22mix-fw_edu_hq-math_1b_hq%22%3A%20%22Gemma-3%201B%22%2C%20%22mix-fw_edu_hq-math_270m_hq%22%3A%20%22Gemma-3%20270M%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%2C%20%22Gemma-3%3A%20REWIRE%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-guided_rewrite_original_27b_hq%22%3A%20%22Gemma-3%2027B%22%2C%20%22mix-fw_edu_hq-guided_rewrite_original_12b_hq%22%3A%20%22Gemma-3%2012B%22%2C%20%22mix-fw_edu_hq-guided_rewrite_original_4b_hq%22%3A%20%22Gemma-3%204B%22%2C%20%22mix-fw_edu_hq-guided_rewrite_original_1b_hq%22%3A%20%22Gemma-3%201B%22%2C%20%22mix-fw_edu_hq-guided_rewrite_original_270m_hq%22%3A%20%22Gemma-3%20270M%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%2C%20%22Gemma-3%3A%20Tutorial%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-tutorial_27b_hq%22%3A%20%22Gemma-3%2027B%22%2C%20%22mix-fw_edu_hq-tutorial_12b_hq%22%3A%20%22Gemma-3%2012B%22%2C%20%22mix-fw_edu_hq-tutorial_4b_hq%22%3A%20%7B%22display%22%3A%20%22Gemma-3%204B%22%2C%20%22color%22%3A%20%22%237b5c99%22%7D%2C%20%22mix-fw_edu_hq-tutorial_1b_hq%22%3A%20%22Gemma-3%201B%22%2C%20%22mix-fw_edu_hq-tutorial_270m_hq%22%3A%20%22Gemma-3%20270M%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%2C%20%22SmolLM2%3A%20Tutorial%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-tutorial_smollm2_1.7b_hq%22%3A%20%22SmolLM2%201.7B%22%2C%20%22mix-fw_edu_hq-tutorial_smollm2_360m_hq%22%3A%20%22SmolLM2%20360M%22%2C%20%22mix-fw_edu_hq-tutorial_smollm2_135m_hq%22%3A%20%22SmolLM2%20135M%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%7D%7D" width="100%" height="600px" frameBorder="0"></iframe>

> *Hình 5: Hiệu suất các quy mô mô hình trên Gemma-3 và SmolLM2.*

Đối với prompt `math` và `tutorial`, mô hình 270M có hiệu suất kém hơn, nhưng các mô hình từ 1B đến 27B cho thấy **không có sự khác biệt đáng kể nào**. SmolLM2 (135M, 360M, 1.7B) cũng cho thấy điều tương tự trên prompt `tutorial`: có một sự cải thiện hiệu suất rõ rệt lên đến ngưỡng ~1B, sau đó bão hòa.

Ngoại lệ duy nhất là `guided_rewrite`, nơi mô hình 4B nhỉnh hơn một chút so với 1B, trong khi 4B đến 27B vẫn tương đương nhau. Prompt này phức tạp hơn đáng kể (hướng dẫn viết lại chi tiết, tiêu chí chất lượng, yêu cầu định dạng nhiều bước), điều này có thể đã nâng cao ngưỡng năng lực tối thiểu của mô hình generator.

**Kết luận:** Vượt qua một ngưỡng năng lực cơ bản (khoảng 1B cho prompt đơn giản và 4B cho prompt phức tạp), các mô hình lớn hơn không giúp tạo ra dữ liệu tổng hợp tốt hơn. Điều này khớp với các phát hiện từ nghiên cứu thực nghiệm quy mô lớn của tác giả khác (cho thấy mở rộng generator từ 8B lên 70B không mang lại dữ liệu pretraining tốt hơn) và SwallowMath-v2 (cho thấy không có cải thiện nào trên dữ liệu toán học khi nâng quy mô rewriter từ Qwen3-30B lên Qwen3-235B). Đây là một tin rất tốt cho ngân sách: bạn có thể sử dụng các mô hình nhỏ, rẻ và nhanh cho hầu hết các tác vụ rephrasing.

REWIRE tuyên bố rằng bạn cần các mô hình lớn để "cứu vớt" dữ liệu chất lượng thấp. Điều đó có đúng không?

#### Chúng ta có cần Mô hình tốt hơn để rephrase Dữ liệu chất lượng thấp không?

REWIRE sử dụng Llama-3.3 70B và lập luận rằng việc nâng cấp dữ liệu chất lượng thấp đòi hỏi các mô hình lớn. Chúng tôi kiểm chứng điều này bằng cách so sánh Gemma-3-1B với Gemma-3-12B trên dữ liệu nguồn HQ (chất lượng cao) và LQ (chất lượng thấp) trên bốn prompt (`continue`, `summarize`, `faq`, `tutorial`). Sử dụng dropdown Setup để chuyển đổi giữa các prompt:

<iframe src="/embeds/d3-benchmark-comparison.html#config=%7B%22setups%22%3A%20%7B%22Continue%20Prompt%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-continue_12b_hq%22%3A%20%2212B%2C%20HQ%20Source%22%2C%20%22mix-fw_edu_hq-continue_1b_hq%22%3A%20%221B%2C%20HQ%20Source%22%2C%20%22mix-fw_edu_hq-continue_1b_lq%22%3A%20%221B%2C%20LQ%20Source%22%2C%20%22mix-fw_edu_hq-continue_12b_lq%22%3A%20%2212B%2C%20LQ%20Source%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%2C%20%22Summarize%20Prompt%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-summarize_1b_hq%22%3A%20%221B%2C%20HQ%20Source%22%2C%20%22mix-fw_edu_hq-summarize_12b_hq%22%3A%20%2212B%2C%20HQ%20Source%22%2C%20%22mix-fw_edu_hq-summarize_1b_lq%22%3A%20%221B%2C%20LQ%20Source%22%2C%20%22mix-fw_edu_hq-summarize_12b_lq%22%3A%20%2212B%2C%20LQ%20Source%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%2C%20%22FAQ%20Prompt%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-faq_1b_hq%22%3A%20%221B%2C%20HQ%20Source%22%2C%20%22mix-fw_edu_hq-faq_1b_lq%22%3A%20%221B%2C%20LQ%20Source%22%2C%20%22mix-fw_edu_hq-faq_12b_hq%22%3A%20%2212B%2C%20HQ%20Source%22%2C%20%22mix-fw_edu_hq-faq_12b_lq%22%3A%20%2212B%2C%20LQ%20Source%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%2C%20%22Tutorial%20Prompt%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-tutorial_1b_hq%22%3A%20%221B%2C%20HQ%20Source%22%2C%20%22mix-fw_edu_hq-tutorial_12b_hq%22%3A%20%2212B%2C%20HQ%20Source%22%2C%20%22mix-fw_edu_hq-tutorial_12b_lq%22%3A%20%2212B%2C%20LQ%20Source%22%2C%20%22mix-fw_edu_hq-tutorial_1b_lq%22%3A%20%221B%2C%20LQ%20Source%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%7D%7D" width="100%" height="600px" frameBorder="0"></iframe>

> *Hình 6: Mô hình 1B so với 12B trên dữ liệu nguồn HQ và LQ.*

Kết quả thu được khá hỗn hợp: với một số prompt, mô hình 12B giúp cải thiện nhẹ đối với dữ liệu LQ, nhưng đối với prompt `faq`, mô hình 1B thực tế lại giành chiến thắng. Chúng tôi không thấy lợi thế nhất quán nào của việc sử dụng mô hình lớn hơn cho dữ liệu chất lượng thấp.

Như vậy, quy mô mô hình không ảnh hưởng nhiều. Nhưng nếu chúng ta sử dụng sai họ mô hình thì sao?

#### Họ Mô hình có Quan trọng không?

Chúng tôi thử nghiệm 6 họ mô hình (SmolLM2, Falcon3, Qwen3, Gemma-3, Granite3, Llama-3.2) ở quy mô ~1B trên 8 prompt khác nhau:

> *Ghi chú: Chúng tôi giả định rằng hiệu suất rephrase mạnh mẽ nhất quán của SmolLM2 bắt nguồn từ các tác vụ viết lại (rewrite) được thiết kế rõ ràng trong tập dữ liệu instruction-tuning (smoltalk) của nó. Điều này nghĩa là mô hình đã được huấn luyện cách viết lại rất tốt trước khi chúng tôi đưa prompt vào.*

<iframe src="/embeds/d3-benchmark-comparison.html#config=%7B%22setups%22%3A%20%7B%22Article%20Prompt%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-article_smollm2_1.7b_hq%22%3A%20%22SmolLM2%22%2C%20%22mix-fw_edu_hq-article_falcon3_1b_hq%22%3A%20%22Falcon3%22%2C%20%22mix-fw_edu_hq-article_granite3_1b_hq%22%3A%20%22Granite3%22%2C%20%22mix-fw_edu_hq-article_1b_hq%22%3A%20%22Gemma-3%22%2C%20%22mix-fw_edu_hq-article_llama3.2_1b_hq%22%3A%20%22Llama-3.2%22%2C%20%22mix-fw_edu_hq-article_qwen3_1.7b_hq%22%3A%20%22Qwen3%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%2C%20%22Discussion%20Prompt%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-discussion_smollm2_1.7b_hq%22%3A%20%22SmolLM2%22%2C%20%22mix-fw_edu_hq-discussion_falcon3_1b_hq%22%3A%20%22Falcon3%22%2C%20%22mix-fw_edu_hq-discussion_granite3_1b_hq%22%3A%20%22Granite3%22%2C%20%22mix-fw_edu_hq-discussion_1b_hq%22%3A%20%22Gemma-3%22%2C%20%22mix-fw_edu_hq-discussion_llama3.2_1b_hq%22%3A%20%22Llama-3.2%22%2C%20%22mix-fw_edu_hq-discussion_qwen3_1.7b_hq%22%3A%20%22Qwen3%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%2C%20%22Explanation%20Prompt%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-explanation_smollm2_1.7b_hq%22%3A%20%22SmolLM2%22%2C%20%22mix-fw_edu_hq-explanation_falcon3_1b_hq%22%3A%20%22Falcon3%22%2C%20%22mix-fw_edu_hq-explanation_granite3_1b_hq%22%3A%20%22Granite3%22%2C%20%22mix-fw_edu_hq-explanation_1b_hq%22%3A%20%22Gemma-3%22%2C%20%22mix-fw_edu_hq-explanation_llama3.2_1b_hq%22%3A%20%22Llama-3.2%22%2C%20%22mix-fw_edu_hq-explanation_qwen3_1.7b_hq%22%3A%20%22Qwen3%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%2C%20%22FAQ%20Prompt%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-faq_smollm2_1.7b_hq%22%3A%20%22SmolLM2%22%2C%20%22mix-fw_edu_hq-faq_falcon3_1b_hq%22%3A%20%22Falcon3%22%2C%20%22mix-fw_edu_hq-faq_granite3_1b_hq%22%3A%20%22Granite3%22%2C%20%22mix-fw_edu_hq-faq_1b_hq%22%3A%20%22Gemma-3%22%2C%20%22mix-fw_edu_hq-faq_llama3.2_1b_hq%22%3A%20%22Llama-3.2%22%2C%20%22mix-fw_edu_hq-faq_qwen3_1.7b_hq%22%3A%20%22Qwen3%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%2C%20%22Math%20Prompt%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-math_smollm2_1.7b_hq%22%3A%20%22SmolLM2%22%2C%20%22mix-fw_edu_hq-math_falcon3_1b_hq%22%3A%20%22Falcon3%22%2C%20%22mix-fw_edu_hq-math_granite3_1b_hq%22%3A%20%22Granite3%22%2C%20%22mix-fw_edu_hq-math_1b_hq%22%3A%20%22Gemma-3%22%2C%20%22mix-fw_edu_hq-math_llama3.2_1b_hq%22%3A%20%22Llama-3.2%22%2C%20%22mix-fw_edu_hq-math_qwen3_1.7b_hq%22%3A%20%22Qwen3%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%2C%20%22Narrative%20Prompt%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-narrative_smollm2_1.7b_hq%22%3A%20%22SmolLM2%22%2C%20%22mix-fw_edu_hq-narrative_falcon3_1b_hq%22%3A%20%22Falcon3%22%2C%20%22mix-fw_edu_hq-narrative_granite3_1b_hq%22%3A%20%22Granite3%22%2C%20%22mix-fw_edu_hq-narrative_1b_hq%22%3A%20%22Gemma-3%22%2C%20%22mix-fw_edu_hq-narrative_llama3.2_1b_hq%22%3A%20%22Llama-3.2%22%2C%20%22mix-fw_edu_hq-narrative_qwen3_1.7b_hq%22%3A%20%22Qwen3%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%2C%20%22Table%20Prompt%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-table_smollm2_1.7b_hq%22%3A%20%22SmolLM2%22%2C%20%22mix-fw_edu_hq-table_falcon3_1b_hq%22%3A%20%22Falcon3%22%2C%20%22mix-fw_edu_hq-table_granite3_1b_hq%22%3A%20%22Granite3%22%2C%20%22mix-fw_edu_hq-table_1b_hq%22%3A%20%22Gemma-3%22%2C%20%22mix-fw_edu_hq-table_llama3.2_1b_hq%22%3A%20%22Llama-3.2%22%2C%20%22mix-fw_edu_hq-table_qwen3_1.7b_hq%22%3A%20%22Qwen3%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%2C%20%22Tutorial%20Prompt%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-tutorial_smollm2_1.7b_hq%22%3A%20%22SmolLM2%22%2C%20%22mix-fw_edu_hq-tutorial_falcon3_1b_hq%22%3A%20%22Falcon3%22%2C%20%22mix-fw_edu_hq-tutorial_granite3_1b_hq%22%3A%20%22Granite3%22%2C%20%22mix-fw_edu_hq-tutorial_1b_hq%22%3A%20%22Gemma-3%22%2C%20%22mix-fw_edu_hq-tutorial_llama3.2_1b_hq%22%3A%20%22Llama-3.2%22%2C%20%22mix-fw_edu_hq-tutorial_qwen3_1.7b_hq%22%3A%20%22Qwen3%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%7D%7D" width="100%" height="600px" frameBorder="0"></iframe>

> *Hình 7: So sánh các họ mô hình ở quy mô ~1B.*

Kết quả vô cùng ấn tượng: **SmolLM2 luôn dẫn đầu và vượt trội rõ rệt so với tất cả các họ mô hình khác trên mọi prompt**.

Nhưng lợi thế đó thực sự đến từ đâu? Hãy chuyển sang SQuAD: SmolLM2 dẫn trước trung bình khoảng +10pp so với các họ mô hình khác trên tất cả các prompt. Nó cũng vượt lên ở TriviaQA (lên tới +5pp). Trên HellaSwag, PIQA và GSM8K, sự khác biệt giữa các họ mô hình là rất nhỏ (1-2pp). Sự thống trị tổng thể của SmolLM2 phần lớn là câu chuyện về hiệu suất QA.

SmolLM2 đã được phát hành một thời gian. Nếu chất lượng mô hình thực sự quan trọng, liệu chúng ta có nên chờ đợi thế hệ tiếp theo không?

> *Ghi chú: SmolLM3 đã được phát hành trong thời gian chúng tôi thực hiện các thí nghiệm, nhưng do xung đột phiên bản thư viện với vLLM dùng trong pipeline, chúng tôi chưa thể tích hợp nó vào nghiên cứu này.*

#### Thế hệ Mô hình có Ảnh hưởng gì không?

Chúng tôi so sánh các thế hệ mô hình Qwen từ phiên bản 1.5, 2, 2.5 đến 3 trên prompt `tutorial`:

<iframe src="/embeds/d3-benchmark-comparison.html#config=%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-tutorial_qwen3_1.7b_hq%22%3A%20%22Qwen3%20%281.7B%29%22%2C%20%22mix-fw_edu_hq-tutorial_qwen2.5_1.5b_hq%22%3A%20%22Qwen2.5%20%281.5B%29%22%2C%20%22mix-fw_edu_hq-tutorial_qwen2_1.5b_hq%22%3A%20%22Qwen2%20%281.5B%29%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%2C%20%22mix-fw_edu_hq-tutorial_qwen1.5_1.8b_hq%22%3A%20%22Qwen1.5%20%281.8B%29%22%7D%7D" width="100%" height="600px" frameBorder="0"></iframe>

> *Hình 8: Các thế hệ mô hình Qwen (1.5 đến 3) trên prompt tutorial.*

Sự khác biệt là khá nhỏ, nhưng có một xu hướng cải thiện nhất quán: các phiên bản mới hơn mang lại hiệu suất đánh giá tốt hơn một chút, đặc biệt là sự tiến bộ lũy kế từ phiên bản 1.5 lên phiên bản 3.

---

> [!TIP]
> **Tóm tắt: Tác động của Mô hình Diễn đạt lại**
> - **Quy mô mô hình:** Mô hình 1B là đủ. Các mô hình lớn hơn không giúp ích nhiều.
> - **Họ mô hình:** SmolLM2 thống trị trên tất cả các prompt.
> - **Thế hệ mô hình:** Các thế hệ mới hơn cho kết quả tốt hơn một chút.
> - **Lời khuyên thực tiễn:** Hãy sử dụng mô hình 1B mới nhất và có khả năng rephrase tốt nhất mà bạn có thể tìm thấy.

Chúng ta đã khám phá kỹ lưỡng khía cạnh mô hình. Câu hỏi tiếp theo: sự lựa chọn tập dữ liệu ảnh hưởng thế nào?

---

### Tác động của Việc Lựa chọn Tập dữ liệu

Cho đến nay, chúng tôi luôn trộn dữ liệu tổng hợp với một **tập dữ liệu nguồn** (source dataset — tập dữ liệu được rephrase) và một **tập dữ liệu trộn** (mix-in dataset — tập dữ liệu gốc được trộn thêm trong quá trình huấn luyện). Nhưng liệu chúng ta có thực sự cần dữ liệu gốc không? Và nếu có, chúng ta nên trộn tập dữ liệu nào?

#### Chỉ dùng Dữ liệu Tổng hợp liệu có đủ?

Kịch bản trong mơ là tạo ra toàn bộ dữ liệu huấn luyện một cách tổng hợp mà không cần thu thập dữ liệu web tự nhiên. Chúng tôi kiểm chứng điều này bằng cách so sánh việc huấn luyện chỉ dùng dữ liệu tổng hợp (synthetic-only) với huấn luyện trộn (mixed: dữ liệu tổng hợp + dữ liệu nguồn gốc) trên các prompt khác nhau với nguồn DCLM và FineWeb-Edu-HQ:

<iframe src="/embeds/d3-benchmark-comparison.html#config=%7B%22hideAverage%22%3A%20true%2C%20%22setups%22%3A%20%7B%22DCLM%20Source%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-dclm-article_1b_dclm%22%3A%20%22Mix%3A%20Article%20%2B%20DCLM%22%2C%20%22mix-dclm-commentary_1b_dclm%22%3A%20%22Mix%3A%20Commentary%20%2B%20DCLM%22%2C%20%22mix-dclm-discussion_1b_dclm%22%3A%20%22Mix%3A%20Discussion%20%2B%20DCLM%22%2C%20%22mix-dclm-faq_1b_dclm%22%3A%20%22Mix%3A%20FAQ%20%2B%20DCLM%22%2C%20%22mix-dclm-math_1b_dclm%22%3A%20%22Mix%3A%20Math%20%2B%20DCLM%22%2C%20%22mix-dclm-table_1b_dclm%22%3A%20%22Mix%3A%20Table%20%2B%20DCLM%22%2C%20%22mix-dclm-tutorial_1b_dclm%22%3A%20%22Mix%3A%20Tutorial%20%2B%20DCLM%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%2C%20%22article_1b_dclm%22%3A%20%22Article%20Only%22%2C%20%22commentary_1b_dclm%22%3A%20%22Commentary%20Only%22%2C%20%22discussion_1b_dclm%22%3A%20%22Discussion%20Only%22%2C%20%22faq_1b_dclm%22%3A%20%22FAQ%20Only%22%2C%20%22math_1b_dclm%22%3A%20%22Math%20Only%22%2C%20%22table_1b_dclm%22%3A%20%22Table%20Only%22%2C%20%22tutorial_1b_dclm%22%3A%20%22Tutorial%20Only%22%7D%7D%2C%20%22FineWeb-Edu-HQ%20Source%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-article_1b_hq%22%3A%20%22Mix%3A%20Article%20%2B%20FineWeb-Edu-HQ%22%2C%20%22mix-fw_edu_hq-commentary_1b_hq%22%3A%20%22Mix%3A%20Commentary%20%2B%20FineWeb-Edu-HQ%22%2C%20%22mix-fw_edu_hq-discussion_1b_hq%22%3A%20%22Mix%3A%20Discussion%20%2B%20FineWeb-Edu-HQ%22%2C%20%22mix-fw_edu_hq-faq_1b_hq%22%3A%20%22Mix%3A%20FAQ%20%2B%20FineWeb-Edu-HQ%22%2C%20%22mix-fw_edu_hq-math_1b_hq%22%3A%20%22Mix%3A%20Math%20%2B%20FineWeb-Edu-HQ%22%2C%20%22mix-fw_edu_hq-table_1b_hq%22%3A%20%22Mix%3A%20Table%20%2B%20FineWeb-Edu-HQ%22%2C%20%22mix-fw_edu_hq-tutorial_1b_hq%22%3A%20%22Mix%3A%20Tutorial%20%2B%20FineWeb-Edu-HQ%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%2C%20%22article_1b_hq%22%3A%20%22Article%20Only%22%2C%20%22commentary_1b_hq%22%3A%20%22Commentary%20Only%22%2C%20%22discussion_1b_hq%22%3A%20%22Discussion%20Only%22%2C%20%22faq_1b_hq%22%3A%20%22FAQ%20Only%22%2C%20%22math_1b_hq%22%3A%20%22Math%20Only%22%2C%20%22table_1b_hq%22%3A%20%22Table%20Only%22%2C%20%22tutorial_1b_hq%22%3A%20%22Tutorial%20Only%22%7D%7D%7D%7D" width="100%" height="600px" frameBorder="0"></iframe>

> *Hình 9: Chỉ dùng dữ liệu tổng hợp so với huấn luyện trộn.*

Thật không may, **việc chỉ huấn luyện trên dữ liệu tổng hợp cho hiệu suất kém hơn hẳn so với cả baseline DCLM và huấn luyện trộn**. Việc trộn thêm dữ liệu gốc luôn mang lại kết quả cải thiện rõ rệt so với cả hai baseline (chỉ dùng dữ liệu tổng hợp hoặc chỉ dùng dữ liệu gốc), bất kể loại prompt nào. Điều này tương đồng với nghiên cứu của tác giả khác (chỉ ra dữ liệu tổng hợp thuần túy không bao giờ vượt qua văn bản web tự nhiên đơn lẻ, nhưng trộn khoảng 30% dữ liệu tổng hợp rephrase với văn bản tự nhiên có thể tăng tốc độ hội tụ pretraining 5-10 lần).

Nhìn vào từng benchmark sẽ thấy rõ hơn: các benchmark được hưởng lợi nhiều nhất từ việc trộn là HellaSwag (+0.5 đến +1.3pp) và SQuAD (+4 đến +12pp đối với Tutorial và FAQ). GSM8K gần như không thay đổi. Bài học "luôn trộn với dữ liệu gốc" chủ yếu được thúc đẩy bởi sự phục hồi khả năng suy luận thông thường, chứ không phải do sự cải thiện đồng đều ở tất cả các kỹ năng.

Như vậy, chúng ta luôn cần trộn thêm dữ liệu gốc. Nhưng mọi thí nghiệm trước đây đều phân chia cố định ở tỷ lệ 50/50. Vậy tỷ lệ dữ liệu tổng hợp thực sự tối ưu là bao nhiêu?

#### Cần Trộn bao nhiêu Dữ liệu Tổng hợp?

Để tìm câu trả lời, chúng tôi quét tỷ lệ dữ liệu tổng hợp từ 10% đến 90% với bước nhảy 10% cho bốn prompt chiến thắng (`faq`, `math`, `table`, `tutorial`), giữ nguyên tổng token budget huấn luyện và chỉ thay đổi tỷ lệ pha trộn. Generator được chọn là SmolLM2-1.7B (mô hình tốt nhất của chúng tôi), và tập dữ liệu trộn là FineWeb-Edu-HQ.

<iframe src="/embeds/d3-benchmark-comparison.html#config=%7B%22defaultView%22%3A%20%22bar%22%2C%20%22defaultMetric%22%3A%20%22agg_score_macro%22%2C%20%22sortBars%22%3A%20false%2C%20%22setups%22%3A%20%7B%22Math%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-0.9-fw_edu_hq-0.1-math_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2210%25%22%2C%20%22color%22%3A%20%22%234575b4%22%7D%2C%20%22mix-0.8-fw_edu_hq-0.2-math_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2220%25%22%2C%20%22color%22%3A%20%22%23576dab%22%7D%2C%20%22mix-0.7-fw_edu_hq-0.3-math_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2230%25%22%2C%20%22color%22%3A%20%22%236964a2%22%7D%2C%20%22mix-0.6-fw_edu_hq-0.4-math_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2240%25%22%2C%20%22color%22%3A%20%22%237b5c99%22%7D%2C%20%22mix-0.5-fw_edu_hq-0.5-math_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2250%25%22%2C%20%22color%22%3A%20%22%238d5490%22%7D%2C%20%22mix-0.4-fw_edu_hq-0.6-math_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2260%25%22%2C%20%22color%22%3A%20%22%23a04c87%22%7D%2C%20%22mix-0.3-fw_edu_hq-0.7-math_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2270%25%22%2C%20%22color%22%3A%20%22%23b2437e%22%7D%2C%20%22mix-0.2-fw_edu_hq-0.8-math_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2280%25%22%2C%20%22color%22%3A%20%22%23c43b75%22%7D%2C%20%22mix-0.1-fw_edu_hq-0.9-math_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2290%25%22%2C%20%22color%22%3A%20%22%23d6336c%22%7D%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%2C%20%22Table%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-0.9-fw_edu_hq-0.1-table_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2210%25%22%2C%20%22color%22%3A%20%22%234575b4%22%7D%2C%20%22mix-0.8-fw_edu_hq-0.2-table_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2220%25%22%2C%20%22color%22%3A%20%22%23576dab%22%7D%2C%20%22mix-0.7-fw_edu_hq-0.3-table_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2230%25%22%2C%20%22color%22%3A%20%22%236964a2%22%7D%2C%20%22mix-0.6-fw_edu_hq-0.4-table_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2240%25%22%2C%20%22color%22%3A%20%22%237b5c99%22%7D%2C%20%22mix-0.5-fw_edu_hq-0.5-table_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2250%25%22%2C%20%22color%22%3A%20%22%238d5490%22%7D%2C%20%22mix-0.4-fw_edu_hq-0.6-table_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2260%25%22%2C%20%22color%22%3A%20%22%23a04c87%22%7D%2C%20%22mix-0.3-fw_edu_hq-0.7-table_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2270%25%22%2C%20%22color%22%3A%20%22%23b2437e%22%7D%2C%20%22mix-0.2-fw_edu_hq-0.8-table_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2280%25%22%2C%20%22color%22%3A%20%22%23c43b75%22%7D%2C%20%22mix-0.1-fw_edu_hq-0.9-table_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2290%25%22%2C%20%22color%22%3A%20%22%23d6336c%22%7D%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%2C%20%22FAQ%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-0.9-fw_edu_hq-0.1-faq_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2210%25%22%2C%20%22color%22%3A%20%22%234575b4%22%7D%2C%20%22mix-0.8-fw_edu_hq-0.2-faq_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2220%25%22%2C%20%22color%22%3A%20%22%23576dab%22%7D%2C%20%22mix-0.7-fw_edu_hq-0.3-faq_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2230%25%22%2C%20%22color%22%3A%20%22%236964a2%22%7D%2C%20%22mix-0.6-fw_edu_hq-0.4-faq_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2240%25%22%2C%20%22color%22%3A%20%22%237b5c99%22%7D%2C%20%22mix-0.5-fw_edu_hq-0.5-faq_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2250%25%22%2C%20%22color%22%3A%20%22%238d5490%22%7D%2C%20%22mix-0.4-fw_edu_hq-0.6-faq_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2260%25%22%2C%20%22color%22%3A%20%22%23a04c87%22%7D%2C%20%22mix-0.3-fw_edu_hq-0.7-faq_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2270%25%22%2C%20%22color%22%3A%20%22%23b2437e%22%7D%2C%20%22mix-0.2-fw_edu_hq-0.8-faq_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2280%25%22%2C%20%22color%22%3A%20%22%23c43b75%22%7D%2C%20%22mix-0.1-fw_edu_hq-0.9-faq_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2290%25%22%2C%20%22color%22%3A%20%22%23d6336c%22%7D%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%2C%20%22Tutorial%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-0.9-fw_edu_hq-0.1-tutorial_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2210%25%22%2C%20%22color%22%3A%20%22%234575b4%22%7D%2C%20%22mix-0.8-fw_edu_hq-0.2-tutorial_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2220%25%22%2C%20%22color%22%3A%20%22%23576dab%22%7D%2C%20%22mix-0.7-fw_edu_hq-0.3-tutorial_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2230%25%22%2C%20%22color%22%3A%20%22%236964a2%22%7D%2C%20%22mix-0.6-fw_edu_hq-0.4-tutorial_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2240%25%22%2C%20%22color%22%3A%20%22%237b5c99%22%7D%2C%20%22mix-0.5-fw_edu_hq-0.5-tutorial_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2250%25%22%2C%20%22color%22%3A%20%22%238d5490%22%7D%2C%20%22mix-0.4-fw_edu_hq-0.6-tutorial_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2260%25%22%2C%20%22color%22%3A%20%22%23a04c87%22%7D%2C%20%22mix-0.3-fw_edu_hq-0.7-tutorial_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2270%25%22%2C%20%22color%22%3A%20%22%23b2437e%22%7D%2C%20%22mix-0.2-fw_edu_hq-0.8-tutorial_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2280%25%22%2C%20%22color%22%3A%20%22%23c43b75%22%7D%2C%20%22mix-0.1-fw_edu_hq-0.9-tutorial_smollm2_1.7b_hq%22%3A%20%7B%22display%22%3A%20%2290%25%22%2C%20%22color%22%3A%20%22%23d6336c%22%7D%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%7D%7D" width="100%" height="600px" frameBorder="0"></iframe>

> *Hình 10: Hiệu suất khi tỷ lệ dữ liệu tổng hợp quét từ 10% đến 90% cho bốn prompt.*

Mỗi định dạng prompt đều có một điểm tối ưu (optimum) thực sự nằm ở khoảng giữa dữ liệu gốc thuần túy và dữ liệu tổng hợp thuần túy, và điểm tối ưu này phụ thuộc vào định dạng prompt:
- `math` cần nhiều dữ liệu tổng hợp nhất (tối ưu ở mức 80%).
- `table` đạt đỉnh ở mức 70%.
- `faq` và `tutorial` đạt đỉnh ở mức 60%.

Như vậy, tỷ lệ pha trộn 50/50 mà chúng ta (và hầu hết các nghiên cứu trước đây) chọn làm mặc định chỉ rơi vào vùng hợp lý một cách ngẫu nhiên. Đáng mừng là các đường cong hiệu suất tăng dần đến đỉnh rồi đi ngang hoặc giảm nhẹ chứ không sụp đổ hoàn toàn, do đó bất kỳ tỷ lệ nào trong khoảng 60–80% đều là lựa chọn an toàn cho cả bốn định dạng.

`table` là cấu hình trộn 2 thành phần mạnh nhất nói chung: nó vượt đỉnh rõ rệt trên baseline DCLM và nhỉnh hơn `math`, trong khi `faq` và `tutorial` theo sau. Chuyển đổi metric đánh giá để thấy rõ nguồn gốc của phần hiệu suất tăng thêm này: chúng tập trung ở phần đọc hiểu (SQuAD tăng đều đặn khi tỷ lệ dữ liệu tổng hợp tăng lên) và ở GSM8K đối với prompt toán, trong khi các benchmark suy luận thông thường và kiến thức thế giới như HellaSwag, PIQA, và MMLU đi ngang. Đây vẫn là sự đánh đổi quen thuộc: **dữ liệu tổng hợp giúp mô hình học các kỹ năng đọc hiểu và toán cụ thể, chứ không cung cấp thêm kiến thức thế giới rộng lớn.**

#### Tập Dữ liệu Trộn (Mix-in Dataset) có Quan trọng không?

Chúng tôi áp dụng prompt `tutorial` sử dụng Gemma-3-1B trên nguồn FineWeb-Edu-HQ, sau đó trộn với một trong bốn tập dữ liệu: DCLM, Cosmopedia, FineWeb-Edu-HQ, hoặc FineWeb-Edu-LQ. Sử dụng Setup dropdown để xem kết quả với dữ liệu nguồn LQ:

<iframe src="/embeds/d3-benchmark-comparison.html#config=%7B%22setups%22%3A%20%7B%22HQ%20Source%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-dclm-tutorial_1b_hq%22%3A%20%7B%22display%22%3A%20%22Mix-in%3A%20DCLM%22%2C%20%22color%22%3A%20%22%234e79a7%22%7D%2C%20%22mix-fw_edu_hq-tutorial_1b_hq%22%3A%20%7B%22display%22%3A%20%22Mix-in%3A%20FineWeb-Edu-HQ%22%2C%20%22color%22%3A%20%22%2359a14f%22%7D%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22DCLM%22%2C%20%22color%22%3A%20%22%234e79a7%22%2C%20%22shaded%22%3A%20true%7D%2C%20%22mix-fw_edu_lq-tutorial_1b_hq%22%3A%20%7B%22display%22%3A%20%22Mix-in%3A%20FineWeb-Edu-LQ%22%2C%20%22color%22%3A%20%22%23e15759%22%7D%2C%20%22mix-cosmopedia-tutorial_1b_hq%22%3A%20%7B%22display%22%3A%20%22Mix-in%3A%20Cosmopedia%22%2C%20%22color%22%3A%20%22%23f28e2b%22%7D%2C%20%22cosmopedia%22%3A%20%7B%22display%22%3A%20%22Cosmopedia%22%2C%20%22color%22%3A%20%22%23f28e2b%22%2C%20%22shaded%22%3A%20true%7D%2C%20%22fw_edu_hq%22%3A%20%7B%22display%22%3A%20%22FineWeb-Edu-HQ%22%2C%20%22color%22%3A%20%22%2359a14f%22%2C%20%22shaded%22%3A%20true%7D%2C%20%22fw_edu_lq%22%3A%20%7B%22display%22%3A%20%22FineWeb-Edu-LQ%22%2C%20%22color%22%3A%20%22%23e15759%22%2C%20%22shaded%22%3A%20true%7D%7D%7D%2C%20%22LQ%20Source%22%3A%20%7B%22datasets%22%3A%20%7B%22dclm%22%3A%20%7B%22display%22%3A%20%22DCLM%22%2C%20%22color%22%3A%20%22%234e79a7%22%2C%20%22shaded%22%3A%20true%7D%2C%20%22mix-fw_edu_hq-tutorial_1b_lq%22%3A%20%7B%22display%22%3A%20%22Mix-in%3A%20FineWeb-Edu-HQ%22%2C%20%22color%22%3A%20%22%2359a14f%22%7D%2C%20%22mix-dclm-tutorial_1b_lq%22%3A%20%7B%22display%22%3A%20%22Mix-in%3A%20DCLM%22%2C%20%22color%22%3A%20%22%234e79a7%22%7D%2C%20%22mix-cosmopedia-tutorial_1b_lq%22%3A%20%7B%22display%22%3A%20%22Mix-in%3A%20Cosmopedia%22%2C%20%22color%22%3A%20%22%23f28e2b%22%7D%2C%20%22cosmopedia%22%3A%20%7B%22display%22%3A%20%22Cosmopedia%22%2C%20%22color%22%3A%20%22%23f28e2b%22%2C%20%22shaded%22%3A%20true%7D%2C%20%22mix-fw_edu_lq-tutorial_1b_lq%22%3A%20%7B%22display%22%3A%20%22Mix-in%3A%20FineWeb-Edu-LQ%22%2C%20%22color%22%3A%20%22%23e15759%22%2C%20%22shaded%22%3A%20true%7D%2C%20%22fw_edu_hq%22%3A%20%7B%22display%22%3A%20%22FineWeb-Edu-HQ%22%2C%20%22color%22%3A%20%22%2359a14f%22%2C%20%22shaded%22%3A%20true%7D%2C%20%22fw_edu_lq%22%3A%20%7B%22display%22%3A%20%22FineWeb-Edu-LQ%22%2C%20%22color%22%3A%20%22%23e15759%22%2C%20%22shaded%22%3A%20true%7D%7D%7D%7D%7D" width="100%" height="600px" frameBorder="0"></iframe>

> *Hình 11: Ảnh hưởng của các tập dữ liệu trộn khác nhau.*

DCLM vượt trội hơn các tập dữ liệu trộn khác trên diện rộng. Việc bổ sung dữ liệu tổng hợp giúp cải thiện hiệu suất cho tất cả các tập dữ liệu trộn, đặc biệt có tác dụng rõ rệt đối với các tập dữ liệu yếu hơn. Đây là một bất ngờ lớn: **lựa chọn tập dữ liệu trộn là một yếu tố quyết định hiệu suất quan trọng, đôi khi còn quan trọng hơn cả bản thân dữ liệu tổng hợp.**

Nhìn vào từng benchmark sẽ thấy thế mạnh bổ sung của DCLM và FineWeb-Edu-HQ:
- Với nguồn dữ liệu chất lượng cao (HQ): DCLM làm mix-in giúp khôi phục hầu hết tín hiệu suy luận thông thường (commonsense) mà quá trình rephrase đã phá vỡ, trong khi FineWeb-Edu-HQ thì không. Ngược lại trên SQuAD và DROP, FineWeb-Edu-HQ lại dẫn trước về khả năng đọc hiểu. DCLM dẫn trước một chút trên điểm số micro vì khả năng tăng suy luận thông thường của nó trải rộng trên nhiều benchmark hơn.
- Với nguồn dữ liệu chất lượng thấp (LQ): FineWeb-Edu-HQ thực tế lại vượt qua DCLM. Lý do nằm ở ARC: FineWeb-Edu-HQ làm mix-in đạt điểm số cao hơn +6pp so với DCLM làm mix-in. Khi dữ liệu nguồn ban đầu có chất lượng thấp, văn bản rephrase mang ít kiến thức khoa học hơn, khiến nội dung giáo dục của dữ liệu trộn đóng vai trò quan trọng hơn, và định hướng giáo dục của FineWeb-Edu-HQ đã phát huy tác dụng.

**Bài học rút ra:** DCLM là tập dữ liệu trộn tốt hơn cho dữ liệu nguồn chất lượng cao, nhưng FineWeb-Edu-HQ có thể là lựa chọn tốt hơn khi rephrase dữ liệu nguồn chất lượng thấp.

Nếu tập dữ liệu trộn quan trọng như vậy, thế còn tập dữ liệu nguồn (seed data) mà chúng ta rephrase thì sao?

#### Tập Dữ liệu Nguồn có Quan trọng không?

Chúng tôi tiến hành rephrase bốn tập dữ liệu nguồn (DCLM, Cosmopedia, FineWeb-Edu-HQ, FineWeb-Edu-LQ) với prompt `faq` và `tutorial` dưới hai chế độ:
- (Chế độ A): Tập dữ liệu trộn trùng với tập dữ liệu nguồn (mix-in = source).
- (Chế độ B): Tập dữ liệu trộn cố định là FineWeb-Edu-HQ.

Trước hết, đây là những gì xảy ra khi tập dữ liệu trộn thay đổi cùng với dữ liệu nguồn (Chế độ A):

<iframe src="/embeds/d3-benchmark-comparison.html#config=%7B%22setups%22%3A%20%7B%22FAQ%20Prompt%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-dclm-faq_1b_dclm%22%3A%20%22Source%3A%20DCLM%22%2C%20%22mix-fw_edu_hq-faq_1b_hq%22%3A%20%22Source%3A%20FineWeb-Edu-HQ%22%2C%20%22mix-fw_edu_lq-faq_1b_lq%22%3A%20%22Source%3A%20FineWeb-Edu-LQ%22%2C%20%22mix-cosmopedia-faq_1b_cosmopedia%22%3A%20%22Source%3A%20Cosmopedia%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%2C%20%22Tutorial%20Prompt%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-tutorial_1b_hq%22%3A%20%22Source%3A%20FineWeb-Edu-HQ%22%2C%20%22mix-dclm-tutorial_1b_dclm%22%3A%20%22Source%3A%20DCLM%22%2C%20%22mix-cosmopedia-tutorial_1b_cosmopedia%22%3A%20%22Source%3A%20Cosmopedia%22%2C%20%22mix-fw_edu_lq-tutorial_1b_lq%22%3A%20%22Source%3A%20FineWeb-Edu-LQ%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%7D%7D" width="100%" height="600px" frameBorder="0"></iframe>

> *Hình 12: Ảnh hưởng của tập dữ liệu nguồn khi tập trộn trùng với nguồn.*

Có vẻ như chất lượng dữ liệu nguồn rất quan trọng: FineWeb-Edu-HQ và DCLM vượt trội rõ rệt so với FineWeb-Edu-LQ và Cosmopedia. Nhưng khi chúng tôi **cố định tập dữ liệu trộn là FineWeb-Edu-HQ** (Chế độ B), sự khác biệt do dữ liệu nguồn gần như biến mất:

<iframe src="/embeds/d3-benchmark-comparison.html#config=%7B%22setups%22%3A%20%7B%22FAQ%20Prompt%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-faq_1b_dclm%22%3A%20%22Source%3A%20DCLM%22%2C%20%22mix-fw_edu_hq-faq_1b_hq%22%3A%20%22Source%3A%20FineWeb-Edu-HQ%22%2C%20%22mix-fw_edu_hq-faq_1b_lq%22%3A%20%22Source%3A%20FineWeb-Edu-LQ%22%2C%20%22mix-fw_edu_hq-faq_1b_cosmopedia%22%3A%20%22Source%3A%20Cosmopedia%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%2C%20%22Tutorial%20Prompt%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-tutorial_1b_dclm%22%3A%20%22Source%3A%20DCLM%22%2C%20%22mix-fw_edu_hq-tutorial_1b_hq%22%3A%20%22Source%3A%20FineWeb-Edu-HQ%22%2C%20%22mix-fw_edu_hq-tutorial_1b_cosmopedia%22%3A%20%22Source%3A%20Cosmopedia%22%2C%20%22mix-fw_edu_hq-tutorial_1b_lq%22%3A%20%22Source%3A%20FineWeb-Edu-LQ%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%7D%7D" width="100%" height="600px" frameBorder="0"></iframe>

> *Hình 13: Ảnh hưởng của dữ liệu nguồn khi cố định tập trộn là FineWeb-Edu-HQ.*

Đây là một phát hiện rất thú vị: **bạn có thể rephrase thậm chí cả dữ liệu chất lượng thấp và vẫn nhận được kết quả cạnh tranh tốt, miễn là bạn ghép đôi nó với một tập dữ liệu trộn mạnh.** Điều này mở ra một lượng dữ liệu nguồn tiềm năng khổng lồ để chúng ta khai thác. Nhưng liệu chúng ta có thể cải thiện thêm hiệu suất bằng cách đa dạng hóa phần dữ liệu tổng hợp không?

#### Tăng cường tính Đa dạng liệu có Giúp ích không?

Chúng tôi thử nghiệm ba chiến lược tăng tính đa dạng: trộn nhiều prompt, trộn nhiều họ mô hình rewriter, và trộn cả hai. Sử dụng Setup dropdown để so sánh các chiến lược:

> *Ghi chú: Thú vị là khi trộn đủ số lượng prompt khác nhau, chúng tôi thấy không còn cần tập dữ liệu nguồn cho hiệu suất tốt nữa. Điều này có thể hiểu là dữ liệu tổng hợp đa dạng có khả năng thay thế cho dữ liệu gốc, trong khi một tập dữ liệu tổng hợp đơn lẻ thì không thể.*

<iframe src="/embeds/d3-benchmark-comparison.html#config=%7B%22setups%22%3A%20%7B%22Mixing%20Prompts%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-tutorial_1b_hq-fw_edu_hq-faq_1b_hq-table_1b_hq-math_1b_hq%22%3A%20%22All%20Prompts%20%2B%20FineWeb-Edu-HQ%22%2C%20%22mix-fw_edu_hq-math_1b_hq%22%3A%20%22Math%20%2B%20FineWeb-Edu-HQ%22%2C%20%22mix-tutorial_1b_hq-faq_1b_hq-table_1b_hq-math_1b_hq%22%3A%20%22All%20Prompts%20%28No%20Source%29%22%2C%20%22mix-fw_edu_hq-table_1b_hq%22%3A%20%22Table%20%2B%20FineWeb-Edu-HQ%22%2C%20%22mix-fw_edu_hq-faq_1b_hq%22%3A%20%22FAQ%20%2B%20FineWeb-Edu-HQ%22%2C%20%22mix-fw_edu_hq-tutorial_1b_hq%22%3A%20%22Tutorial%20%2B%20FineWeb-Edu-HQ%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%2C%20%22Mixing%20Models%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-tutorial_smollm2_1.7b_hq%22%3A%20%22SmolLM2%22%2C%20%22mix-fw_edu_hq-tutorial_smollm2_1.7b_hq-tutorial_falcon3_1b_hq%22%3A%20%22SmolLM2%20%2B%20Falcon3%22%2C%20%22mix-fw_edu_hq-tutorial_smollm2_1.7b_hq-tutorial_llama3.2_1b_hq%22%3A%20%22SmolLM2%20%2B%20Llama-3.2%22%2C%20%22mix-fw_edu_hq-tutorial_llama3.2_1b_hq-tutorial_granite3_1b_hq%22%3A%20%22Llama-3.2%20%2B%20Granite3%22%2C%20%22mix-fw_edu_hq-tutorial_llama3.2_1b_hq%22%3A%20%22Llama-3.2%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%2C%20%22Mixing%20Both%22%3A%20%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-faq_smollm2_1.7b_hq%22%3A%20%22FAQ%20%28SmolLM2%29%22%2C%20%22mix-fw_edu_hq-faq_smollm2_1.7b_hq-tutorial_falcon3_1b_hq%22%3A%20%22FAQ%20%28SmolLM2%29%20%2B%20Tutorial%20%28Falcon3%29%22%2C%20%22mix-fw_edu_hq-tutorial_smollm2_1.7b_hq%22%3A%20%22Tutorial%20%28SmolLM2%29%22%2C%20%22mix-fw_edu_hq-tutorial_smollm2_1.7b_hq-tutorial_falcon3_1b_hq%22%3A%20%22Tutorial%20%28SmolLM2%29%20%2B%20Tutorial%20%28Falcon3%29%22%2C%20%22mix-fw_edu_hq-tutorial_falcon3_1b_hq%22%3A%20%22Tutorial%20%28Falcon3%29%22%2C%20%22mix-fw_edu_hq-faq_falcon3_1b_hq%22%3A%20%22FAQ%20%28Falcon3%29%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%7D%7D%7D%7D" width="100%" height="600px" frameBorder="0"></iframe>

> *Hình 14: Các chiến lược tăng tính đa dạng.*

Không có chiến lược nào cho thấy sự cải thiện vượt trội so với cấu hình đơn lẻ tốt nhất. Hiệu suất có xu hướng lấy trung bình cộng (average) thay vì cộng dồn (compound). Điều này hơi đáng thất vọng. Nghiên cứu EntiGraph chỉ ra rằng việc paraphrase đơn giản nhanh chóng bão hòa, trong khi cách tiếp cận dựa trên thực thể của họ mở rộng tuyến tính nhờ cấu trúc đa dạng. Prompt của chúng tôi có thể đã nắm bắt đủ sự đa dạng cấu trúc ở quy mô 20B token, nhưng lợi thế của sự đa dạng có thể sẽ xuất hiện rõ hơn ở quy mô lớn hơn nữa khi mô hình có thể khai thác các tín hiệu phong phú.

---

> [!TIP]
> **Tóm tắt: Tác động của Việc Lựa chọn Tập dữ liệu**
> - **Chỉ dùng dữ liệu tổng hợp:** Không đủ. Luôn trộn thêm dữ liệu gốc.
> - **Tỷ lệ dữ liệu tổng hợp:** 60–80% là tối ưu (toán 80%, bảng 70%, faq/tutorial 60%). Tỷ lệ đồng đều 1/N chỉ ở mức trung bình một cách ngẫu nhiên.
> - **Tập dữ liệu trộn:** Là động lực hiệu suất cốt lõi. DCLM và FineWeb-Edu-HQ bổ sung thế mạnh cho nhau (suy luận thông thường vs kiến thức giáo dục). Lựa chọn tối ưu phụ thuộc vào chất lượng dữ liệu nguồn.
> - **Tập dữ liệu nguồn:** Thứ yếu. Với tập dữ liệu trộn mạnh, ngay cả các nguồn chất lượng thấp cũng hoạt động hiệu quả.
> - **Tính đa dạng:** Không có tác dụng cộng dồn ở quy mô 20B token. Hiệu suất trung bình hóa hơn là cải thiện.
> - **Lời khuyên thực tiễn:** Hãy đầu tư vào một tập dữ liệu trộn chất lượng cao. DCLM cho dữ liệu nguồn chất lượng cao, FineWeb-Edu-HQ cho dữ liệu nguồn chất lượng thấp.

Chúng ta đã bao quát prompt, mô hình và dữ liệu. Hãy cùng xem xét câu hỏi cuối cùng: mức độ nhạy cảm của hệ thống đối với các chi tiết nhỏ trong prompt.

---

### Lỗi Chính tả (Typos) trong Prompt có gây Hại không?

Trong quá trình triển khai prompt REWIRE, chúng tôi nhận thấy nó chứa một vài lỗi chính tả và lỗi ngữ pháp. Chúng tôi đã tiến hành dọn dẹp, sửa lỗi chính tả và chạy cả hai phiên bản:

<iframe src="/embeds/d3-benchmark-comparison.html#config=%7B%22datasets%22%3A%20%7B%22mix-fw_edu_hq-guided_rewrite_original_12b_hq%22%3A%20%22Original%20%2812B%29%22%2C%20%22mix-fw_edu_hq-guided_rewrite_improved_12b_hq%22%3A%20%22Improved%20%2812B%29%22%2C%20%22dclm%22%3A%20%7B%22display%22%3A%20%22Baseline%20%28DCLM%29%22%2C%20%22color%22%3A%20%22%238b8b8b%22%2C%20%22baseline%22%3A%20true%7D%2C%20%22mix-fw_edu_hq-guided_rewrite_original_1b_hq%22%3A%20%22Original%20%281B%29%22%2C%20%22mix-fw_edu_hq-guided_rewrite_improved_1b_hq%22%3A%20%22Improved%20%281B%29%22%7D%7D" width="100%" height="600px" frameBorder="0"></iframe>

> *Hình 15: Prompt REWIRE gốc chứa typo so với phiên bản đã sửa lỗi ở quy mô 1B và 12B.*

**Lỗi chính tả hoàn toàn không gây hại.** Đối với mô hình 1B, phiên bản gốc đầy lỗi chính tả không có hiệu suất kém hơn phiên bản đã được tinh chỉnh sạch sẽ, khoảng cách hiệu suất hoàn toàn nằm trong mức nhiễu chạy ngẫu nhiên. Không cần quá cầu kỳ trau chuốt từng ký tự trong prompt.

---

### Các Điểm cốt lõi Rút ra

Hãy cùng tóm tắt các câu trả lời cho các câu hỏi chính:

| Câu hỏi | Câu trả lời |
| :--- | :--- |
| **Hiệu suất các tập dữ liệu hiện có ra sao?** | DCLM, Nemotron-HQ-Synth và REWIRE dẫn đầu. Các tập dữ liệu tổng hợp khác tụt lại sau. |
| **Prompt đơn lẻ nào từ baseline bắt kịp DCLM?** | Chỉ có Diverse QA Pairs và Guided Rewrite của REWIRE. |
| **Các prompt mới có đánh bại được DCLM không?** | Có. FAQ, Math, Table và Tutorial đều vượt qua DCLM. Article, Commentary, Discussion, Explanation và Narrative thì không. |
| **Quy mô mô hình tạo dữ liệu có quan trọng không?** | Không nhiều. Quy mô 1B là đủ cho prompt đơn giản, 4B cho các prompt phức tạp. |
| **Có cần mô hình tốt hơn cho dữ liệu chất lượng thấp không?** | Không có lợi thế nhất quán nào từ mô hình lớn trên dữ liệu chất lượng thấp. |
| **Họ mô hình có quan trọng không?** | Có. SmolLM2 vượt trội hơn hẳn trên tất cả các prompt. |
| **Thế hệ mô hình có quan trọng không?** | Một chút. Các thế hệ Qwen mới hơn cho xu hướng tốt hơn. |
| **Chỉ dùng dữ liệu tổng hợp có đủ không?** | Không. Luôn pha trộn dữ liệu tổng hợp với dữ liệu gốc tự nhiên. |
| **Nên trộn bao nhiêu dữ liệu tổng hợp?** | 60–80%, phụ thuộc vào định dạng (toán 80%, bảng 70%, faq/tutorial 60%). Tỷ lệ 50/50 chỉ ở mức trung bình ngẫu nhiên. |
| **Tập dữ liệu trộn (mix-in) có quan trọng không?** | Có, là yếu tố định hình hiệu suất chính. DCLM phục hồi khả năng suy luận, FineWeb-Edu-HQ cung cấp kiến thức giáo dục. Lựa chọn phụ thuộc vào nguồn dữ liệu. |
| **Tập dữ liệu nguồn (seed) có quan trọng không?** | Không nhiều nếu có tập dữ liệu trộn mạnh. Ngay cả nguồn chất lượng thấp cũng cho kết quả cạnh tranh. |
| **Tính đa dạng có giúp ích không?** | Không có tác dụng cộng dồn ở quy mô 20B token. Hiệu suất có xu hướng trung bình hóa. |
| **Typo trong prompt có gây hại không?** | Không. Lỗi chính tả không gây ảnh hưởng tiêu cực nào đến hiệu suất mô hình ở giai đoạn sau. |

**Tóm lại, điều gì thực sự quyết định sự thành bại?** Thiết kế cấu trúc prompt là yếu tố quan trọng hàng đầu. Các định dạng prompt có cấu trúc chặt chẽ như FAQ, Math, Table và Tutorial luôn đánh bại các baseline tuyển chọn mạnh mẽ nhất. Tất cả các khía cạnh khác đều rất dễ dung thứ: mô hình generator 1B xử lý các prompt đơn giản một cách hoàn hảo, 4B lo liệu các prompt phức tạp, mở rộng quy mô lớn hơn không mang lại giá trị gia tăng nào. Chất lượng dữ liệu nguồn ban đầu cũng không quá khắt khe, miễn là bạn pha trộn nó với dữ liệu gốc chất lượng tốt.

Công thức mà chúng tôi đúc rút ra rất đơn giản: **chọn một prompt có cấu trúc tốt, sử dụng mô hình nhỏ nhất có thể xử lý nó, pha trộn với dữ liệu gốc chất lượng cao, và dành tài nguyên tính toán tiết kiệm được để tăng quy mô khối lượng dữ liệu huấn luyện.**

Bây giờ, hãy cùng xem xét chi tiết *tại sao* những điều này lại hoạt động như vậy.
