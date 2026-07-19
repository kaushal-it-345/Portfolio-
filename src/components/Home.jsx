import Header from './Header';
import About from './About';
import Skills from './Skills';

function Home() {
    const skills = ["HTML", "CSS", "JavaScript", "React", "Git"];

    return (
        <div>
            <Header name="Kaushal Patel" themeColor="#1abc9c" />
            <div className="portfolio-grid">
                <About />
                <Skills title="My Skills" skills={skills} />
            </div>
        </div>
    );
}

export default Home;
