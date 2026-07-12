import Header from './components/Header';
import About from './components/About';
import Skills from './components/Skills';
import Footer from './components/Footer';

function App(){
const skills = ["HTML","CSS","JavaScript","React","Git"];

return(

<div>
    <Header name="Kaushal Patel" themeColor="#1abc9c"/>
    <div className="portfolio-grid">
        <About />
        <Skills title="my SKills" skills={skills} />
    </div>
    <Footer email="abc@gmail.com"/>
</div>

);
}

export default App;