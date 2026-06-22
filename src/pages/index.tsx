import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Playbook Dữ liệu Tổng hợp: FinePhrase VI`}
      description="Bản dịch tiếng Việt hoàn chỉnh của FinePhrase Technical Report từ Hugging Face.">
      
      {/* Hero Section */}
      <header className="custom-hero">
        <div className="container">
          <div className="hero-badge">Bản dịch tiếng Việt • Hugging Face FW</div>
          <Heading as="h1" className="gradient-title">
            FinePhrase 🍷
          </Heading>
          <p className="hero-tagline">
            Playbook Dữ liệu Tổng hợp: Tạo ra hàng nghìn tỷ Token chất lượng nhất — Tìm kiếm công thức tối ưu nhất cho dữ liệu pretraining tổng hợp thông qua 333 thí nghiệm huấn luyện-và-đánh giá trên 90 cấu hình diễn đạt lại (rephrasing).
          </p>
          <div className="cta-group">
            <Link
              className="button button--primary button--lg"
              style={{ borderRadius: '8px', padding: '0.8rem 2rem', fontWeight: 600 }}
              to="/docs/gioi_thieu">
              Bắt đầu đọc tài liệu 📖
            </Link>
            <a
              className="button button--secondary button--lg"
              style={{ borderRadius: '8px', padding: '0.8rem 2rem', fontWeight: 600 }}
              href="https://huggingface.co/spaces/HuggingFaceFW/finephrase"
              target="_blank"
              rel="noopener noreferrer">
              Bài viết gốc 🔗
            </a>
          </div>
        </div>
      </header>

      <main className="container" style={{ paddingBottom: '4rem' }}>
        {/* Key Highlights Section */}
        <section>
          <Heading as="h2" className="section-title">
            Điểm nhấn kỹ thuật nổi bật
          </Heading>
          <div className="grid-container">
            <div className="glass-panel">
              <span className="highlight-badge">HIỆU QUẢ CỰC ĐẠI</span>
              <h3 className="highlight-title">33M Tokens/Giờ GPU H100 ⚡</h3>
              <p className="highlight-desc">
                Hiệu quả gấp 30 lần so với REWIRE và hơn 13 lần so với Cosmopedia nhờ sử dụng mô hình sinh dữ liệu 1.7B (so với 70B), giải mã suy đoán suffix-32 và các cấu hình tối ưu.
              </p>
            </div>
            <div className="glass-panel">
              <span className="highlight-badge">CẤU TRÚC ĐA DẠNG</span>
              <h3 className="highlight-title">📊 FAQ, Math, Table, Tutorial</h3>
              <p className="highlight-desc">
                Phân tích tác động của việc diễn đạt lại văn bản web thành 4 định dạng cấu trúc chất lượng cao, giúp nâng cao đáng kể kết quả trên các bài toán downstream.
              </p>
            </div>
            <div className="glass-panel">
              <span className="highlight-badge">QUY MÔ LỚN</span>
              <h3 className="highlight-title">486 Tỷ Tokens tổng hợp 🌐</h3>
              <p className="highlight-desc">
                Sản phẩm của quá trình chạy phân tán 100 tác vụ song song trên cụm Slurm bằng thư viện DataTrove kết hợp vLLM, đã được mở nguồn toàn diện.
              </p>
            </div>
          </div>
        </section>

        {/* Chapters Section */}
        <section style={{ marginTop: '2rem' }}>
          <Heading as="h2" className="section-title">
            Các chương nội dung chính
          </Heading>
          <div className="grid-container">
            <Link to="/docs/gioi_thieu" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass-panel" style={{ height: '100%' }}>
                <span className="highlight-badge">CHƯƠNG 1 &amp; 2</span>
                <h3 className="highlight-title">Giới thiệu &amp; Thiết lập ⚙️</h3>
                <p className="highlight-desc">
                  Bối cảnh chuyển dịch sang dữ liệu tổng hợp trong huấn luyện LLM và cách thức thiết lập prompt diễn đạt lại dữ liệu web.
                </p>
              </div>
            </Link>

            <Link to="/docs/thi_nghiem" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass-panel" style={{ height: '100%' }}>
                <span className="highlight-badge">CHƯƠNG 3 &amp; 4</span>
                <h3 className="highlight-title">Thí nghiệm &amp; Phân tích 🧪</h3>
                <p className="highlight-desc">
                  Chi tiết 333 thí nghiệm và các phân tích chuyên sâu về họ mô hình sinh, chất lượng dữ liệu nguồn, tính đa dạng template, và tỷ lệ trộn tối ưu.
                </p>
              </div>
            </Link>

            <Link to="/docs/ha_tang" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass-panel" style={{ height: '100%' }}>
                <span className="highlight-badge">CHƯƠNG 5 &amp; 6</span>
                <h3 className="highlight-title">Hạ tầng &amp; FinePhrase 🏗️</h3>
                <p className="highlight-desc">
                  Pipeline song song với DataTrove, custom rollouts, benchmark tối ưu hóa throughput trên H100 và quá trình sinh 486B tokens.
                </p>
              </div>
            </Link>

            <Link to="/docs/ket_luan" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass-panel" style={{ height: '100%' }}>
                <span className="highlight-badge">CHƯƠNG 7 &amp; 8</span>
                <h3 className="highlight-title">Kết luận &amp; Phụ lục 📚</h3>
                <p className="highlight-desc">
                  Đúc rút các bài học đắt giá, hướng đi tiếp theo với các mô hình ngôn ngữ khuếch tán, các template prompt đầy đủ và chi tiết huấn luyện.
                </p>
              </div>
            </Link>
          </div>
        </section>

        {/* Bottom Call to Action */}
        <section className="bottom-cta">
          <Heading as="h2" style={{ fontWeight: 800, fontSize: '2rem', marginBottom: '1.5rem', fontFamily: 'var(--ifm-heading-font-family)' }}>
            Sẵn sàng làm chủ công nghệ dữ liệu tổng hợp?
          </Heading>
          <p style={{ maxWidth: '600px', margin: '0 auto 2rem', color: '#64748b' }}>
            Toàn bộ các phân tích thực nghiệm, kinh nghiệm tối ưu hóa throughput suy luận và pipeline Slurm mở nguồn đã được dịch thuật chính xác và tự nhiên.
          </p>
          <Link
            className="button button--primary button--lg"
            style={{ borderRadius: '8px', padding: '0.8rem 2.5rem', fontWeight: 600 }}
            to="/docs/gioi_thieu">
            Đọc báo cáo kỹ thuật 🍷
          </Link>
        </section>
      </main>
    </Layout>
  );
}

