---
sidebar_position: 8
sidebar_label: '8. Phụ lục'
---

# 📚 Phụ lục

### Chi tiết về các thí nghiệm

Đối với các thí nghiệm ablation (thử nghiệm loại trừ), chúng tôi huấn luyện một mô hình ngôn ngữ kích thước 1.7B tham số sử dụng kiến trúc dạng Qwen2 [@qwen2] gồm 28 lớp, kích thước ẩn (hidden dimension) là 2048, 16 head attention với 8 head key-value (attention truy vấn nhóm - grouped-query attention [@gqa]), và kích thước trung gian (intermediate size) là 6144. Mô hình sử dụng bộ mã hóa từ vựng (tokenizer) Llama 3.2 [@llama3] (`hynky/Llama-3.2-1B-no-bos`) với kích thước từ vựng là 128.256 token. Quá trình huấn luyện được thực hiện trên 64 GPU NVIDIA H100 80GB trên 8 node sử dụng song song dữ liệu thuần túy (pure data parallelism - DP=64) với kích thước batch toàn cục (global batch size) là 512 và độ dài chuỗi (sequence length) là 4.096 token, tổng cộng tích lũy khoảng 21 tỷ token qua 10.000 bước. Chúng tôi sử dụng bộ tối ưu hóa AdamW [@adamw] với tốc độ học (learning rate) là 5×10⁻⁴, β₁=0.9, β₂=0.95, suy giảm trọng số (weight decay) là 0.1, và cắt ngưỡng gradient (gradient clipping) là 1.0. Tất cả quá trình huấn luyện sử dụng độ chính xác bfloat16 với Flash Attention 2 [@flashattention2], các phép toán hợp nhất (fused operations gồm chuẩn hóa RMS normalization và nhúng quay rotary embeddings [@rope]), và che mặt nạ tài liệu (document masking) để ngăn attention chéo giữa các tài liệu. Mục tiêu của chúng tôi là diễn đạt lại ít nhất 10 tỷ token cho mỗi thí nghiệm, nhưng do số lượng token đầu ra (completion tokens) thực tế của từng prompt có sự biến động lớn, đôi khi chúng tôi thu được ít hơn mục tiêu đó. Trong các trường hợp này, chúng tôi tiến hành huấn luyện lặp lại trên một phần dữ liệu (hai lần).

### Các Prompt sử dụng

Dưới đây là các template prompt được sử dụng trong các nghiên cứu của chúng tôi. Để đảm bảo tính chính xác khi tái lập thí nghiệm, các nội dung prompt bên trong hộp văn bản được giữ nguyên bản bằng tiếng Anh.

#### Nhóm BeyondWeb

##### continue

```text
Continue the following text in the same style as the original. Start with the continuation directly.
Text:
[TEXT]
```

##### summarize

```text
Summarize the following text. Write a standalone summary without referencing the text. Directly start with the summary. Do not say anything else.
Text:
[TEXT]
Summary:
```

#### Nhóm Format (Định dạng)

##### article

```text
Transform the document into a magazine-style feature article. Open with an engaging lead, then blend narrative storytelling with factual explanation. Maintain an accessible yet polished tone suitable for a general but informed readership. Output only the feature article, nothing else.
Document:
[TEXT]
```

##### commentary

```text
Summarize the document in a concise paragraph that captures its central arguments or findings. Then, write an expert commentary that critically reflects on its implications, limitations, or broader context. Maintain an analytical and professional tone throughout. Output only the summary and the commentary, nothing else.
Document:
[TEXT]
```

##### discussion

```text
Reformulate the document as a dialogue between a teacher and a student. The teacher should guide the student toward understanding the key points while clarifying complex concepts. Keep the exchange natural, informative, and faithful to the original content. Output only the dialogue, nothing else.
Document:
[TEXT]
```

##### explanation

```text
Rewrite the document to provide clear scientific or logical explanations for concepts, phenomena, or processes mentioned in the text. Make implicit reasoning explicit by explaining why things work the way they do, what principles or mechanisms are at play, and how different factors relate to each other. Focus on building understanding through causal explanations rather than just describing facts. Output only the explanatory text, nothing else.
Document:
[TEXT]
```

##### faq

```text
Rewrite the document as a comprehensive FAQ (Frequently Asked Questions). Extract or infer the key questions a reader would have about this topic, then provide clear, direct answers. Order questions logically—from foundational to advanced, or by topic area. Each answer should be self-contained and understandable without reference to other answers. Ensure the FAQ works as a standalone document. Output only the FAQ, nothing else.
Document:
[TEXT]
```

##### math

```text
Rewrite the document to create a mathematical word problem based on the numerical data or relationships in the text. Provide a step-by-step solution that shows the calculation process clearly. Create a problem that requires multi-step reasoning and basic arithmetic operations. It should include the question followed by a detailed solution showing each calculation step. Output only the problem and solution, nothing else.
Document:
[TEXT]
```

##### narrative

```text
Rewrite the document as a clear narrative that emphasizes the temporal sequence and causal relationships between events or steps. Reorganize the content to show how actions, events, or situations naturally flow from one to the next, making cause-and-effect relationships explicit. If describing a process or activity, show the logical progression of steps and explain why each step follows from the previous one. Output only the narrative, nothing else.
Document:
[TEXT]
```

##### table

```text
Rewrite the document as a structured table that organizes the key information, then generate one question-answer pair based on the table. First extract the main data points and organize them into a clear table format with appropriate headers using markdown table syntax with proper alignment. After the table, generate one insightful question that can be answered using the table data. Provide a clear, concise answer to the question based on the information in the table. Output only the table followed by the question-answer pair, nothing else.
Document:
[TEXT]
```

##### tutorial

```text
Rewrite the document as a clear, step-by-step tutorial or instructional guide. Use numbered steps or bullet points where appropriate to enhance clarity. Preserve all essential information while ensuring the style feels didactic and easy to follow. Output only the tutorial, nothing else.
Document:
[TEXT]
```

#### Nhóm Nemotron

##### distill

```text
Your task is to read and paraphrase the provided text following these instructions:
- Aim to create a condensed but accurate and informative version of the original text, not a simplistic summary.
- Capture and preserve the crucial information, key concepts, important values, and factual details in the original text, while making it more readable and accessible.
- Retain technical terms, specialized vocabulary, and complex concepts.
- Retain examples, explanations of reasoning processes, and supporting evidence to maintain the text's depth and context.
- Only include information that is present in the original text. Do not adding new or unsubstantiated claims.
- Write in plain text.

Here is the text:
[TEXT]
Task:
After thoroughly reading the above text, paraphrase it in high-quality and clear English following the instructions.
```

##### diverse_qa_pairs

```text
Task: Read the text, ask questions and answer them.
Follow these instructions:
1. Ask diverse questions that require different cognitive skills or cover different aspects of the text.
1. Ask questions in various forms such as:
    - Yes/No questions that require determining whether a statement is true or false.
    - Open-ended questions that begin with words like what, how, when, where, why and who.
    - Multi-choice questions that offers two or more options to choose from. Include the options in the question.
    - Comparison questions that compare two quantities or objects and determine the relationship between them.
    - Reading comprehension questions that test the ability to understand and analyze the text.
    - Problem-solving questions that test the ability to solve mathematical, physical, or logical problems.

1. Focus on asking questions about factual information, important knowledge, or concrete details in the text.
1. Write questions and answers using clear and concise language.
1. Use plain text. Do not use Markdown.
1. Each question and answer pair should be on a separate line. Tag the question with "Question:" and the answer with "Answer:".

Text:
[TEXT]
Task:
After reading the above text, ask up to 8 questions and provide the correct answers following the instructions. Give your response in this format:
Here are the questions and answers based on the provided text:
- Question: [first question] Answer: [first answer]
- Question: [second question] Answer: [second answer]

....
```

##### extract_knowledge

```text
Your task is to rewrite knowledge from the provided text following these instructions:
- Rewrite the text as a passage or passages using easy-to-understand and high-quality English like sentences in textbooks and Wikipedia.
- Focus on content in disciplines such as humanities, social sciences, natural sciences, technology, engineering, math, law and legal, business, management, art, education, agricultural sciences, politics, and history.
- Disregard content that does not contain useful facts or knowledge.
- Retain examples, explanations of reasoning processes, and supporting evidence to maintain the text's depth and context.
- Do not add or alter details. Only restate what is already in the text.
- Write in plain text.
- Do not add titles, subtitles, note, or comment.

Text:
[TEXT]
Task:
Rewrite facts and knowledge from the above text as a passage or passages following the instructions.
```

##### knowledge_list

```text
Review the text and extract the key information. Follow these instructions:
- Carefully read the above text and provide a concise and organized list of factual information, concrete details, key concepts, and important numbers and statistics extracted from the text.
- Ensure each point is clear, specific, and supported by the original text.
- Ensure the extract text is information-dense and easier to learn from.
- Do not add titles or headings.

Text:
[TEXT]
Task:
Extract the factual information, concrete details, and key concepts from the above text following the instructions.
```

##### wikipedia_style_rephrasing

```text
For the following paragraph give me a diverse paraphrase of the same in high quality English language as in sentences on Wikipedia. Begin your answer on a separate line with "Here is a paraphrased version:".
Text:
[TEXT]
```

#### Nhóm REWIRE

##### guided_rewrite_improved

```text
Below is a draft from an AI Assistant when trying to accomplish a task or solve a problem. Analyze and understand the task and problem(s) to be solved. Then pretend to be the expert who is most skillful to accomplish this task, and use detailed thinking and internal reasoning to identify a strategy and develop a plan about how to solve this problem. Experts usually apply meta-reasoning and planning to reason about how to best accomplish the task before jumping to a solution.
Deliberate meta-reasoning also involves reflection which can help identify issues and take a step back to explore other paths. Below are some generic examples of starting questions experts could ask themselves during the meta-reasoning process. The expert will come up with the most relevant questions that can help with their thinking process, which are also very specific to the task.
Consider these questions during your internal reasoning process:
- What is the core issue or problem that needs to be addressed? What are the key assumptions underlying this problem?
- How can I break down this problem into smaller, more manageable parts? How can I simplify the problem so that it is easier to solve?
- What kinds of solutions are typically produced for this kind of problem specification? Given the problem specification and the current best solution, what other possible solutions exist? If the current best solution is totally wrong, what other ways are there to think about the problem specifically?
- What is the best way to modify this current best solution, given what you know about these kinds of problem specifications?
- Am I on the right track? Check your progress so far.
- Develop a step by step plan internally.

Finally, rewrite the original content from the author's perspective, maintaining their voice and intent while making substantial improvements. Take information and details from the original draft whenever they are useful. The rewritten content should not be shorter than the original response. The improved version should have significantly better formatting and readability, with more coherent and in-depth reasoning, enhanced clarity, stronger structure, and removal of any noise or digression. Write as if you are the original author meaningfully improving their own work - not just making minor edits.
IMPORTANT: Your output must be ONLY the actual rewritten content itself - nothing else. Do NOT include any analysis, commentary, description, summary, or explanation about the improvements made. Do NOT add any meta-commentary like "This version improves..." or similar statements. Do NOT reference "the original draft" or "the draft" in your output. Output ONLY the content as if it were the final published piece that readers would see, with absolutely no additional text before or after it.
Original Draft:
[TEXT]
```

##### guided_rewrite_original

```text
Below is a draft from an AI Assistant when trying to accomplish task or solving a problem. Analyze and understand the task and problem(s) to be solved. Then pretend to be the expert who is most skillful to acomplish this task, write down the detailed thinking process and internal monologue that went into identifying a strategy and lay out a plan about how to solve this problem. Experts usually apply meta-reasoning and planning to reason about how to best accomplish the task before jumping to solution.
Deliberate meta-reasoning also involves reflection which can help identify issues and take a step back to explore other paths. Below are some generic examples of starting questions experts could ask themselves during meta-reasoning process. The expert will come up with the most relevant questions that can help with their thinking process, which are also very specific to the task.
Let's first try to understand the task and exactly what problem(s) to be solved. What is the core issue or problem that needs to be addressed? What are the key assumptions underlying this problem?
How can I break down this problem into smaller, more manageable parts? How can I simplify the problem so that it is easier to solve?
What kinds of solution typically are produced for this kind of problem specification? Given the problem specification and the current best solution, have a guess about other possible solutions. Let's imagine the current best solution is totally wrong, what other ways are there to think about the problem specific
What is the best way to modify this current best solution, given what you know about these kinds of problem specification?
Am I on the right track? Let's check our progress so far.
Let's make a step by step plan and implement it with good notion and explanation.
Finally, write an improved response after thinking about how to accomplish the task. Take information and details from the original draft whenever they are useful. Therefore, the improved response should not be shorter than the original response. The improved response should have better formatting and readability, with more coherent and in-depth reasoning, while removing any noise or digression. Note that the best experts chosen to answer each prompt may be different, so please make sure the you do not sound like the same expert for all tasks.
IMPORTANT: Start your analysis and thinking right away. DO NOT add any filler text, explanations or notes about your response. Put the thinking and planning between &lt;thinking starts&gt; and &lt;thinking ends&gt;, and the improved response between &lt;improved response starts&gt; and &lt;improved response ends&gt;.
Original Draft: [TEXT]
```

### Huấn luyện Decay so với Huấn luyện từ đầu (Scratch)

Chúng tôi đã khám phá hai phương thức huấn luyện khác nhau. Trong thiết lập **huấn luyện từ đầu (from-scratch)** (`decay_exp=false`), các mô hình được huấn luyện đầy đủ 10.000 bước (~21 tỷ token) trên một tập dữ liệu hoặc hỗn hợp dữ liệu duy nhất. Ngược lại, các thí nghiệm **decay** (`decay_exp=true`) hướng tới việc thu được tín hiệu nhanh hơn với ít token diễn đạt lại hơn bằng cách tận dụng cách tiếp cận huấn luyện hai giai đoạn. Các thí nghiệm decay này khôi phục việc huấn luyện từ checkpoint tại bước 9.000 của một mô hình đã được huấn luyện trước đó trên dữ liệu chất lượng thấp hơn (FineWeb-Edu-LQ), sau đó tiếp tục huấn luyện với một tập dữ liệu (hoặc hỗn hợp dữ liệu) mới trong 1.000 bước cuối cùng (~2 tỷ token) trong pha phân rã tốc độ học (learning rate decay). Chúng tôi lựa chọn FineWeb-Edu-LQ cho giai đoạn huấn luyện đầu tiên để có thể quan sát thấy ảnh hưởng của hỗn hợp dữ liệu ablated rõ ràng hơn. Thiết kế này cho phép đánh giá tác động của dữ liệu chất lượng cao đã diễn đạt lại hoặc dữ liệu tổng hợp hiệu quả hơn, chỉ yêu cầu khoảng 2 tỷ token diễn đạt lại thay vì toàn bộ 21 tỷ token cần thiết cho huấn luyện từ đầu, từ đó cắt giảm 90% chi phí tính toán cho mỗi điều kiện thí nghiệm trong khi vẫn cung cấp tín hiệu có ý nghĩa về chất lượng dữ liệu. Để kích hoạt các thí nghiệm decay, chúng tôi sử dụng lịch trình tốc độ học dạng warmup-stable-decay (WSD) [@minicpm] với 1% warmup (100 bước), 89% huấn luyện ổn định (stable), và 10% phân rã tuyến tính (linear decay - 1.000 bước) về mức tối thiểu 5×10⁻⁵.

#### Độ biến động giữa các seed và data seed

Tham số `seed` đặt seed ngẫu nhiên toàn cục cho thí nghiệm huấn luyện, đảm bảo tính tái lập cho việc khởi tạo trọng số mô hình và các phép toán toàn cục khác giữa các lượt chạy khác nhau. Tham số `data-seed` kiểm soát riêng tính ngẫu nhiên của pipeline dữ liệu, chẳng hạn như trộn (shuffling) và lấy mẫu tập dữ liệu, đảm bảo thứ tự dữ liệu có thể tái lập giữa các lượt huấn luyện khác nhau.

Là một bước xác thực đầu tiên cho thí nghiệm decay, chúng tôi quan tâm đến độ biến động giữa các lượt chạy. Vì vậy, chúng tôi đã chạy một lưới 3x3 seed (1,2,3) và data seed (1,2,3) cho 3 tập dữ liệu: FineWeb-Edu-HQ gốc (vanilla), mix-fw_edu_hq-continue_1b_hq và mix-fw_edu_hq-tutorial_12b_hq. Nhìn chung, chúng tôi thấy độ biến động là khá nhỏ, mang lại sự tin cậy sớm cho thiết lập này.

Khi thực hiện decay với FineWeb-Edu-HQ, điểm trung bình macro tối thiểu là 10.73 và tối đa là 11.05 trên lưới 3x3 seed và data seed. Đối với decay với mix-fw_edu_hq-continue_1b_hq, điểm số dao động từ 12.9 đến 13.21. Cuối cùng, decay với mix-fw_edu_hq-tutorial_12b_hq dao động từ 13.25 đến 13.43.

#### Tương quan với các lượt chạy từ đầu (from-scratch)

Khi huấn luyện từ đầu (from-scratch), thứ tự xếp hạng hiệu năng là: DCLM (13.77) &gt; Nemotron-HQ-Synth (13.54) &gt; FineWeb-Edu-HQ (11.82) &gt; Cosmopedia (10.33) &gt; SYNTH (10.03). 
Đối với thiết lập decay, thứ tự xếp hạng là: Nemotron-HQ-Synth (12.35) &gt; DCLM (11.80) &gt; FineWeb-Edu-HQ (10.66) &gt; Cosmopedia (10.57) &gt; SYNTH (10.50). 
Mặc dù chúng ta thấy sự khác biệt đáng kể giữa FineWeb-Edu-HQ và Cosmopedia/SYNTH khi huấn luyện từ đầu, chúng lại rất gần nhau trong thiết lập decay. Ngoài ra, thứ tự xếp hạng của DCLM và Nemotron-HQ-Synth bị hoán đổi. Sự tương quan này có thể đóng vai trò như một bước kiểm tra cảm quan nhanh (vibe-check) để xác định xem tập dữ liệu đó có hữu ích hay không.
