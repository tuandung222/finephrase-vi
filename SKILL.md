---
name: docusaurus-technical-translation-and-deployment
description: Quy trình chuẩn hóa để dịch thuật tài liệu kỹ thuật chất lượng cao sang tiếng Việt và tự động triển khai lên GitHub Pages bằng Docusaurus.
version: 1.0.0
author: Antigravity
tools_required:
  - node >= 20.0
  - npm >= 10.0
  - git >= 2.40
  - gh >= 2.30
---

# Kỹ năng Dịch thuật Tài liệu Kỹ thuật & Triển khai Docusaurus Tự động

Tài liệu này đóng gói toàn bộ quy trình thiết lập, quản lý dịch thuật kỹ thuật, sửa lỗi cú pháp MDX, cấu hình liên kết, và tự động hóa kích hoạt GitHub Pages nhằm tạo ra một trang tài liệu Docusaurus tiếng Việt đạt chất lượng cao nhất.

---

## 1. ĐỊNH HƯỚNG TƯ DUY & PHONG CÁCH VIẾT (Persona & Writing Persona)

### Tông giọng & Phong cách (Tone & Voice)
* **Chuyên nghiệp, chính xác và thực tế:** Đóng vai trò là một kỹ sư hệ thống/kỹ sư đánh giá mô hình chuyên nghiệp chia sẻ kinh nghiệm thực tiễn.
* **Tự nhiên và trôi chảy (Free Translation):** Ưu tiên dịch thoát ý dựa trên ngữ cảnh công nghệ thay vì dịch thô từ-đối-từ. Đảm bảo câu văn mạch lạc trong tiếng Việt nhưng không làm thay đổi bản chất của tài liệu gốc.
* **Định nghĩa thuật ngữ lần đầu:** Đối với các thuật ngữ cốt lõi chưa có nghĩa tiếng Việt thống nhất, ở lần đầu tiên xuất hiện trong mỗi chương, hãy dịch nghĩa và đặt từ gốc tiếng Anh trong ngoặc đơn. Ví dụ: *suy luận (inference)*, *khả năng tái lập (reproducibility)*.

### Quy tắc Giữ nguyên Thuật ngữ Kỹ thuật
* Giữ nguyên 100% các từ khóa chuyên ngành phổ biến không cần dịch như: `LLM`, `transformer`, `token`, `tokenizer`, `embedding`, `dataset`, `GPU`, `VRAM`, `API`, `prompt`, `Few-shot`, `Zero-shot`, `SFT`, `DPO`, `GRPO`, `YAML`, `JSON`, `Python`, `bash`, `regex`.

### Cách tiếp cận giải quyết xung đột & trình bày bài toán
Khi giải thích một công nghệ hoặc giải pháp kỹ thuật, luôn trình bày theo cấu trúc 4 bước:
1. **Bối cảnh:** Vấn đề thực tế mà hệ thống đang gặp phải.
2. **Xung đột/Thách thức:** Tại sao các giải pháp thông thường không hoạt động hoặc các điểm nghẽn hệ thống (ví dụ: gãy bộ nhớ GPU, độ lệch phân phối dữ liệu).
3. **Toán học & Logic:** Trình bày công thức toán học (LaTeX) hoặc logic thiết kế giải quyết xung đột.
4. **Mã nguồn & Cấu hình:** Cung cấp đoạn mã hoặc file cấu hình minh họa thực tế để người đọc tự triển khai.

---

## 2. CÁC RÀNG BUỘC BẢO MẬT & QUYỀN RIÊNG TƯ (Security & Privacy)

### Ẩn danh Thông tin Nhạy cảm
* **Tuyệt đối không hardcode:** Không lưu trữ API keys, Personal Access Tokens (PAT), địa chỉ email cá nhân, hoặc tên đường dẫn cục bộ chứa tên người dùng của máy phát triển.
* Sử dụng các biến môi trường hoặc cấu hình GitHub Secrets cho các tài nguyên nhạy cảm.

### Chặn Bot Tìm kiếm Index Dữ liệu (SEO & Indexing Restrictions)
* Đối với các bản dịch thử nghiệm hoặc nội dung riêng tư, cấu hình chặn thu thập thông tin bằng cách thêm file `static/robots.txt`:
  ```text
  User-agent: *
  Disallow: /
  ```
* Sử dụng thuộc tính `noindex` trong cấu hình HTML hoặc Docusaurus để ngăn chặn các công cụ tìm kiếm index phiên bản nháp.

### Bảo vệ file README
* Nhằm tránh việc bot tự động quét và đánh chỉ mục nội dung giới thiệu của repository trên các nền tảng mở, hãy đổi tên file `README.md` tại gốc thành `README_X.md`, hoặc duy trì file `README.md` với dung lượng `0 bytes` nếu có yêu cầu nghiêm ngặt từ dự án.

---

## 3. QUY TRÌNH THỰC THI & TỰ ĐỘNG HÓA (Execution Workflow)

### Bước 1: Thiết lập Môi trường & Khởi tạo
1. Tạo dự án Docusaurus phiên bản mới nhất:
   ```bash
   npx -y create-docusaurus@latest {REPOSITORY_NAME} classic --typescript
   ```
2. Cài đặt các phụ bản hỗ trợ hiển thị toán học KaTeX và sơ đồ Mermaid:
   ```bash
   npm install --save @docusaurus/theme-mermaid remark-math rehype-katex katex
   ```

### Bước 2: Thiết lập Cấu hình Git Cục bộ
Để đảm bảo lịch sử đóng góp (commit history) khớp với tài khoản phát triển mà không bị lộ email cá nhân:
```bash
git config --local user.name "{TARGET_GIT_USERNAME}"
git config --local user.email "{TARGET_GIT_EMAIL}"
```

### Bước 3: Dịch thuật, Định dạng & Viết Code
1. Viết bản dịch và định dạng theo tiêu chuẩn MDX.
2. Thay thế toàn bộ admonition định dạng cũ (`:::info`) sang định dạng GFM Alerts mới:
   ```markdown
   > [!NOTE]
   > 📝 **Ghi chú**
   > Nội dung thông điệp ở đây.
   ```
3. Thoát tất cả các ký tự `<` và `>` trần ngoài khối code block bằng `&lt;` và `&gt;`.

### Bước 4: Kiểm tra và Build tĩnh Cục bộ
Chạy lệnh kiểm tra nghiêm ngặt trước khi commit:
```bash
npm run build
```
Đảm bảo kết quả trả về không có bất kỳ cảnh báo gãy liên kết (broken links) hay lỗi phân tích cú pháp MDX.

### Bước 5: Đẩy mã nguồn lên Kho chứa
```bash
git add .
git commit -m "docs: hoàn thành dịch thuật và chuẩn hóa định dạng tài liệu"
git push origin {DEFAULT_BRANCH}
```

### Bước 6: Kích hoạt GitHub Pages thông qua GitHub API (Tự động hóa)
Thay vì thực hiện thủ công trên giao diện web, hãy chạy lệnh GitHub CLI sau để tự động kích hoạt GitHub Pages trên nhánh đích:
```bash
gh api --method POST /repos/{GITHUB_OWNER}/{REPOSITORY_NAME}/pages \
  -f "source[branch]={GH_PAGES_BRANCH}" \
  -f "source[path]=/"
```
Kiểm tra tiến độ và trạng thái deploy bằng lệnh:
```bash
gh api repos/{GITHUB_OWNER}/{REPOSITORY_NAME}/pages
```

---

## 4. XỬ LÝ LỖI THƯỜNG GẶP (Troubleshooting Guide)

### Lỗi 1: Trình biên dịch Docusaurus báo lỗi do thẻ HTML chưa đóng (MDX Parsing Error)
* **Triệu chứng:** Build thất bại với thông báo lỗi cú pháp MDX liên quan đến các ký tự bé hơn hoặc lớn hơn.
* **Nguyên nhân:** Có ký tự `<` hoặc `>` xuất hiện tự do trong văn bản (ví dụ: `kích thước <70B`). Trình biên dịch MDX hiểu nhầm đây là thẻ XML/HTML mở/đóng.
* **Khắc phục:** Thay thế các ký tự này bằng thực thể HTML tương ứng: `&lt;` thay cho `<` và `&gt;` thay cho `>`.

### Lỗi 2: Lỗi liên kết danh mục bị gãy (Broken Category Links)
* **Triệu chứng:** Docusaurus báo lỗi liên kết không tồn tại khi bấm vào các danh mục trên thanh điều hướng hoặc chân trang.
* **Nguyên nhân:** Docusaurus v4 tự sinh slug dựa trên tiêu đề tiếng Việt có dấu trong file cấu hình danh mục (ví dụ `/docs/category/kiến-thức-chung`), gây ra sai lệch ký tự hoặc mã hóa URL.
* **Khắc phục:** Định nghĩa rõ ràng trường `slug` tiếng Anh không dấu dạng `kebab-case` trong từng tệp `_category_.json`:
  ```json
  {
    "label": "Kiến thức Chung",
    "position": 1,
    "link": {
      "type": "generated-index",
      "slug": "/category/general-knowledge"
    }
  }
  ```

### Lỗi 3: Lỗi gãy liên kết tương đối giữa các tệp Markdown
* **Triệu chứng:** Cảnh báo hoặc lỗi gãy liên kết khi tham chiếu chéo giữa các chương (ví dụ: `[Xem thêm](../troubleshooting/troubleshooting_reproducibility.md)`).
* **Nguyên nhân:** Đường dẫn tương đối trỏ trực tiếp đến tệp vật lý `.md` bị lỗi phân giải khi Docusaurus tối ưu hóa cấu trúc URL tĩnh.
* **Khắc phục:** Thay đổi liên kết tương đối thành đường dẫn URL tuyệt đối bắt đầu bằng `/docs/` và bỏ phần mở rộng `.md`.
  * *Sai:* `[Xem thêm](../troubleshooting/troubleshooting_reproducibility.md)`
  * *Đúng:* `[Xem thêm](/docs/troubleshooting/troubleshooting_reproducibility)`

### Lỗi 4: Lỗi phân quyền khi deploy bằng GitHub Actions (Permission Denied)
* **Triệu chứng:** Action deploy chạy thất bại tại bước đẩy code lên nhánh `gh-pages` với mã lỗi `403 Forbidden`.
* **Nguyên nhân:** Mặc định GitHub Actions chỉ có quyền đọc (`read`).
* **Khắc phục:** Bổ sung cấu hình quyền ghi trong tệp cấu hình workflow `.github/workflows/deploy.yml`:
  ```yaml
  permissions:
    contents: write
  ```

---

## 5. TIÊU CHUẨN XÁC MINH HOÀN THÀNH (Verification Checklist)

Để đảm bảo quá trình triển khai thành công và không xảy ra lỗi hiển thị, chạy các kiểm tra tự động sau:

| STT | Phướng pháp kiểm tra | Lệnh thực thi | Tiêu chuẩn đạt |
|---|---|---|---|
| 1 | Xác minh biên dịch tĩnh | `npm run build` | Lệnh chạy thành công (`exit code 0`), `0 warnings`, `0 errors` |
| 2 | Kiểm tra SEO/Index | `grep -i "noindex" build/index.html` | Đảm bảo thẻ noindex xuất hiện đúng cấu hình bảo mật |
| 3 | Kiểm tra trạng thái HTTP của trang live | `curl -o /dev/null -s -w "%{http_code}" https://{GITHUB_OWNER}.github.io/{REPOSITORY_NAME}/` | Kết quả trả về mã trạng thái `200` |
| 4 | Kiểm tra cấu hình base URL | `grep "baseUrl" docusaurus.config.ts` | Khớp chính xác dạng `/{REPOSITORY_NAME}/` (phải có `/` ở cả đầu và cuối) |
| 5 | Kiểm tra tệp tin nhạy cảm | `git status` | Xác nhận các file nhạy cảm không nằm trong danh sách staging |
