# FinePhrase VI 🍷

Bản dịch tiếng Việt hoàn chỉnh và tự nhiên của báo cáo kỹ thuật **"FinePhrase: The Synthetic Data Playbook (Generating Trillions of the Finest Tokens)"** từ Hugging Face.

Dự án này sử dụng [Docusaurus](https://docusaurus.io/) để xây dựng và hiển thị tài liệu dạng web tĩnh, hỗ trợ giao diện sáng/tối, tìm kiếm, công thức toán học LaTeX, sơ đồ Mermaid, và các biểu đồ D3 tương tác từ báo cáo gốc.

## 📖 Giới thiệu về FinePhrase
FinePhrase là một cẩm nang (playbook) toàn diện về dữ liệu tổng hợp (synthetic data) trong huấn luyện mô hình ngôn ngữ lớn (LLM). Báo cáo thực hiện **333 thí nghiệm huấn luyện-và-đánh giá** trên **90 cấu hình diễn đạt lại (rephrasing)** để trả lời cho các câu hỏi cốt lõi:
- Việc diễn đạt lại (rephrasing) văn bản web có thực sự cải thiện chất lượng dữ liệu tiền huấn luyện không?
- Lỗi chính tả trong prompt sinh dữ liệu ảnh hưởng thế nào đến kết quả?
- Tỷ lệ trộn (mix) tối ưu giữa dữ liệu web gốc và dữ liệu tổng hợp là bao nhiêu?
- Làm thế nào để sinh dữ liệu tổng hợp với hiệu năng cực đại (lên tới 33M tokens/giờ GPU H100)?

## 🚀 Cài đặt và Chạy cục bộ

### Yêu cầu hệ thống
- Node.js >= 20.0
- npm >= 10.0

### Các bước cài đặt
1. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```

2. Khởi chạy máy chủ phát triển cục bộ (Local Development Server):
   ```bash
   npm run start
   ```
   Trang web sẽ tự động mở tại `http://localhost:3000`. Hầu hết các thay đổi trong tài liệu Markdown sẽ được cập nhật trực tiếp (hot reload) mà không cần khởi động lại server.

3. Biên dịch phiên bản production:
   ```bash
   npm run build
   ```

## 🏗️ Hạ tầng & Triển khai
Trang web được thiết lập để tự động triển khai lên **GitHub Pages** thông qua GitHub Actions mỗi khi có commit mới được push lên nhánh `main`.
- Quy trình tự động hóa nằm ở tệp [deploy.yml](file:///.github/workflows/deploy.yml).
- Cấu hình Docusaurus nằm ở tệp [docusaurus.config.ts](file:///docusaurus.config.ts).

## 📄 Bản quyền và Tài liệu gốc
- **Tác giả gốc:** Hugging Face FW (FineWeb Team)
- **Tài liệu gốc:** [Hugging Face Space: FinePhrase](https://huggingface.co/spaces/HuggingFaceFW/finephrase)
- **Bản dịch tiếng Việt:** Thực hiện bởi `tuandung222` với tiêu chuẩn dịch thuật kỹ thuật tự nhiên, chính xác và chuyên nghiệp.
