---
sidebar_position: 1
sidebar_label: '1. Giới thiệu'
---

# 📝 Playbook Dữ liệu Tổng hợp: Tạo ra hàng nghìn tỷ Token chất lượng nhất

**Tác giả:** Hugging Face  
**Thời gian đọc:** Một cuối tuần (Để có trải nghiệm tốt nhất, nên đọc trên máy tính thay vì điện thoại).

---

Chúng tôi đã thực hiện 333 thí nghiệm huấn luyện-và-đánh giá trên 90 cấu hình rephrasing (diễn đạt lại) để tìm ra công thức tốt nhất cho dữ liệu pretraining (huấn luyện trước) tổng hợp. Việc tạo ra các tập dữ liệu tổng hợp đó tiêu tốn hơn 1 nghìn tỷ token và 12,7 năm GPU. Kết quả thu được là **FinePhrase**, một tập dữ liệu gồm 486 tỷ token vượt trội rõ rệt so với tất cả các baseline dữ liệu tổng hợp hiện có. Tập dữ liệu này đã được [phát hành trên Hugging Face Hub](https://huggingface.co/datasets/HuggingFaceFW/finephrase), và bài viết này sẽ dẫn dắt bạn qua tất cả những gì chúng tôi học được trong suốt quá trình nghiên cứu này.

<iframe src="/embeds/d3-benchmark-comparison.html" width="100%" height="600px" frameBorder="0"></iframe>

> *Hình 1: So sánh FinePhrase (sử dụng tỷ lệ pha trộn tối ưu nhất là 70% dữ liệu tổng hợp) với các baseline dữ liệu tổng hợp khác trên các metric đánh giá. Xem chi tiết tại phần [cần trộn bao nhiêu dữ liệu tổng hợp](/docs/thi_nghiem#cần-trộn-bao-nhiêu-dữ-liệu-tổng-hợp).*

Nếu bạn đọc một số bài báo về LLM gần đây (ví dụ: Nemotron 3, Qwen3, Phi-4, Arcee Trinity), bạn có thể nhận thấy rằng dữ liệu tổng hợp đã trở thành một thành phần cốt lõi cho dữ liệu huấn luyện LLM. Nó đang nhanh chóng trở thành một công cụ tiêu chuẩn để xây dựng các tập dữ liệu chất lượng cao cho huấn luyện LLM. Nhìn lại lịch sử, chúng ta có thể thấy một số bước chuyển dịch lớn về dữ liệu LLM, đặc biệt là đối với giai đoạn pretraining, và dữ liệu tổng hợp chính là bước tiến tự nhiên mới nhất:

- Sau khi huấn luyện các mô hình ngôn ngữ đầu tiên trên các tập dữ liệu nhỏ như Wikipedia, cộng đồng bắt đầu mở rộng quy mô pretraining bằng cách thu thập ngày càng nhiều dữ liệu từ web. Các tập dữ liệu như C4 và The Pile đã đẩy giới hạn lên hàng trăm gigabyte. Sau đó, FineWeb và DCLM đã đưa quy mô lên mức hàng nghìn tỷ token, bao phủ hầu hết mạng web có thể crawl được.
- Khi tiệm cận giới hạn mở rộng của dữ liệu web, cuộc thảo luận đã chuyển từ số lượng sang chất lượng. Các nhà nghiên cứu bắt đầu với các heuristics mạnh hơn và pipeline deduplication (loại bỏ trùng lặp), sau đó chuyển sang các classifier dựa trên mạng nơ-ron để tìm kiếm dữ liệu "mang tính giáo dục" hoặc "giống như chỉ dẫn". FineWeb-Edu đã sử dụng Llama 3 70B để chấm điểm chất lượng giáo dục, DCLM sử dụng lọc dựa trên mô hình để huấn luyện một mô hình 7B đạt 64% MMLU chỉ với 2,6T token. Với dữ liệu chất lượng cao hơn, việc lặp lại một số phần dữ liệu có vẻ vẫn ổn.
- Hiện tại, khi đã khai thác gần hết dữ liệu văn bản trên web và kết luận rằng chất lượng quan trọng hơn số lượng, dữ liệu tổng hợp trở thành một lựa chọn thú vị để "nâng cấp" (up-cycle) phần dữ liệu đáng lẽ đã bị các classifier loại bỏ, từ đó tăng lại khối lượng dữ liệu. Cosmopedia là một ví dụ ban đầu, tạo ra 25 tỷ token sách giáo khoa và câu chuyện bằng Mixtral. Ngày nay, các LLM mới nhất được huấn luyện trên hàng nghìn tỷ token tổng hợp, tương đương với lượng dữ liệu tự nhiên.
- Nhưng dữ liệu web được index công khai chỉ là một phần của bức tranh toàn cảnh. Một lượng lớn nội dung do người dùng tạo ra (email, tin nhắn, mã nguồn nội bộ) vẫn chưa được khai thác vì chúng chứa thông tin cá nhân (PII), nội dung độc hại hoặc tài liệu có bản quyền. Phương pháp Generative Data Refinement (GDR - Tinh chỉnh dữ liệu sinh) cho thấy LLM có thể ẩn danh và loại bỏ độc tính của dữ liệu này trong khi vẫn giữ nguyên giá trị sử dụng cho huấn luyện, vượt qua cả các công cụ phát hiện PII chuyên dụng chỉ với một prompt zero-shot. Bằng cách thiết lập điều kiện rephrase trên từng ví dụ thực tế, GDR cũng bảo toàn tính đa dạng của dữ liệu gốc, tránh hiện tượng suy sụp mode (mode collapse) thường thấy ở các phương pháp sinh hoàn toàn tổng hợp. Điều này có thể mở rộng đáng kể kho dữ liệu hữu ích vượt ra ngoài những gì có thể crawl công khai.

Chúng ta đang chứng kiến sự chuyển dịch căn bản trong việc phân bổ tài nguyên tính toán (compute) cho huấn luyện mô hình: trong khi việc huấn luyện mô hình chiếm phần lớn compute ban đầu, ngày càng có nhiều tài nguyên được phân bổ để chọn lọc và cải thiện tập dữ liệu huấn luyện, cả trong pretraining và post-training.

Quy mô này thực sự đáng kinh ngạc: NVIDIA đã sử dụng LLM để diễn đạt lại khoảng 2 nghìn tỷ token văn bản web cho tập dữ liệu [Nemotron-CC](https://huggingface.co/datasets/nvidia/Nemotron-CC-v2) của họ, trong khi Z.ai đã tạo ra 500 tỷ token suy luận (reasoning) để huấn luyện giai đoạn giữa (mid-train) cho dòng GLM-4.5. Dưới đây là thống kê lượng dữ liệu tổng hợp mà các mô hình gần đây đang sử dụng:

![Quy mô dữ liệu tổng hợp trong các đợt huấn luyện LLM gần đây](/img/finephrase/synthetic-data-scale.jpg)
*Hình 2: Quy mô sử dụng dữ liệu tổng hợp trong các đợt huấn luyện LLM gần đây. Một số mô hình mới đã được huấn luyện trên hàng trăm tỷ đến hàng nghìn tỷ token tổng hợp.*

Dữ liệu tổng hợp cũng đóng vai trò trung tâm trong post-training thông qua *distillation* (chưng cất), nơi một mô hình mạnh tạo ra dữ liệu huấn luyện mục tiêu cho các lĩnh vực như suy luận, tuân thủ chỉ dẫn, và sử dụng công cụ. Ví dụ, [SmolLM3](https://huggingface.co/spaces/HuggingFaceTB/smol-training-playbook) được post-train gần như hoàn toàn bằng dữ liệu sinh ra từ các mô hình như DeepSeek-R1 và Qwen3.

> *Ghi chú: Trong quá trình huấn luyện SmolLM2, mô hình thực hiện khá tốt nhiệm vụ code và toán nhưng lại hoàn toàn "mất kiểm soát" khi gặp các câu hỏi giao tiếp thông thường (ví dụ: "How are you?", "Hi", "What's up?"). Việc sinh tự động một tập dữ liệu giao tiếp hàng ngày nhỏ đã nhanh chóng giải quyết vấn đề này.*

Tuy nhiên, cách tạo dữ liệu tổng hợp đúng đắn hiện nay vẫn giống như thuật giả kim: Bạn nên dùng mô hình nào? Prompt nào hoạt động tốt nhất và bạn cần bao nhiêu prompt? Và làm thế nào để scale quy trình này một cách hiệu quả?

Mục tiêu của chúng tôi là biến thuật giả kim này thành hóa học: thay thế trực giác bằng các thí nghiệm hệ thống và có khả năng tái lặp. Đây là cách chúng tôi tiếp cận:

> *Ghi chú lịch sử: Nhà hóa học Antoine Lavoisier đã thay thế thuyết phlogiston bằng các phép đo chính xác và thí nghiệm lặp lại được, giúp ông có được danh hiệu "cha đẻ của hóa học hiện đại".*

Chúng tôi bắt đầu bằng cách [Thiết lập bài toán](thiet_lap.md): rephrasing là gì, có những hướng tiếp cận nào và chúng tôi muốn kiểm tra điều gì. Sau đó, chúng tôi đi sâu vào các [Thí nghiệm](thi_nghiem.md) đã thực hiện để tìm ra prompt, mô hình và tập dữ liệu nào thực sự hiệu quả. Phần [Phân tích](phan_tich.md) sẽ thu nhỏ góc nhìn để lý giải *tại sao* mọi thứ lại hoạt động theo cách đó. Tiếp theo là phần [Hạ tầng](ha_tang.md) giúp toàn bộ nghiên cứu này khả thi, bao gồm benchmark chi tiết về throughput (thông lượng) của các mô hình phổ biến (điều cực kỳ quan trọng để tối ưu hóa chi phí dữ liệu). Cuối cùng, chúng tôi [áp dụng công thức này ở quy mô lớn](finephrase.md) để tạo nên tập dữ liệu FinePhrase.

Các phần dưới đây được thiết kế độc lập, vì vậy bạn có thể thoải mái nhảy đến bất kỳ phần nào mình quan tâm.

> [!NOTE]
> **Nhưng chờ đã, còn hiện tượng suy sụp mô hình (model collapse) thì sao?**
> Bạn có thể tự hỏi: việc huấn luyện trên dữ liệu tổng hợp liệu có chắc chắn dẫn đến hiện tượng suy sụp mô hình không? Đây là một hiểu lầm phổ biến bắt nguồn từ nghiên cứu chỉ ra sự suy giảm nghiêm trọng khi mô hình được huấn luyện lặp đi lặp lại chỉ trên dữ liệu do chính nó sinh ra, mà không có bất kỳ thông tin mới hay dữ liệu từ con người.
> 
> Trong thực tế, không ai huấn luyện mô hình theo cách đó. Các quy trình thực tế luôn pha trộn dữ liệu tổng hợp với dữ liệu con người, sử dụng các tài liệu tham khảo đa dạng trong prompt và áp dụng dữ liệu tổng hợp một cách có chiến lược thay vì thay thế toàn bộ tập dữ liệu huấn luyện. Một nghiên cứu thực nghiệm quy mô lớn huấn luyện hơn 1.000 LLM đã xác nhận bức tranh chi tiết này: huấn luyện trên dữ liệu tổng hợp được rephrase trộn với văn bản web tự nhiên (ở tỷ lệ khoảng 30% dữ liệu tổng hợp) có thể tăng tốc độ hội tụ pretraining từ 5 đến 10 lần mà không có dấu hiệu suy giảm hiệu suất.
> 
> Hiện tượng suy sụp mô hình chỉ xảy ra trong một vòng lặp kín trên các đầu ra của mô hình mà không có tín hiệu mới. Sự tích hợp chu đáo dữ liệu tổng hợp mang lại kiến thức hoặc góc nhìn mới lại là một câu chuyện hoàn toàn khác. Trong dự án FineWeb, chúng tôi cũng không tìm thấy sự suy giảm nào từ dữ liệu do AI tạo ra xuất hiện tự nhiên trên web.

Bạn muốn tìm hiểu cách làm cho GPU "chạy hết công suất" (go brrr) và tạo ra các token tổng hợp ở quy mô lớn như thế này? Bài viết này là dành cho bạn!

<iframe src="/embeds/inference-throughput-compare.html" width="100%" height="500px" frameBorder="0"></iframe>

> *Hình 3: Kéo thanh trượt để tăng số lượng GPU và xem tốc độ sinh token tăng lên. Đến cuối bài viết này, bạn sẽ biết chính xác cách thiết lập hệ thống này.*

Bây giờ, hãy bắt đầu bằng cách định nghĩa rephrasing thực sự nghĩa là gì và phác thảo không gian thiết kế của nó.
