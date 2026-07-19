function Projects() {
    const projects = [
        {
            id: 1,
            title: "Student Portfolio",
            description: "A responsive portfolio website built with React and Vite showcasing my projects and skills.",
            technologies: ["React", "Vite", "CSS", "JavaScript"]
        },
        {
            id: 2,
            title: "Todo Application",
            description: "A feature-rich todo app with add, delete, and mark complete functionality using React Hooks.",
            technologies: ["React", "JavaScript", "Local Storage"]
        },
        {
            id: 3,
            title: "Weather App",
            description: "A weather forecast application that fetches real-time data from an API and displays it beautifully.",
            technologies: ["React", "API Integration", "CSS"]
        },
        {
            id: 4,
            title: "Calculator",
            description: "A fully functional calculator built with vanilla JavaScript supporting basic arithmetic operations.",
            technologies: ["JavaScript", "HTML", "CSS"]
        }
    ];

    return (
        <div style={{ padding: '48px 24px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ 
                fontSize: '2.5rem', 
                fontFamily: 'var(--font-heading)',
                marginBottom: '12px',
                color: 'var(--on-bg)'
            }}>
                Projects
            </h1>
            <div style={{ 
                width: '60px', 
                height: '3px', 
                backgroundColor: 'var(--primary)', 
                marginBottom: '48px' 
            }}></div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px'
            }}>
                {projects.map((project) => (
                    <div 
                        key={project.id}
                        className="clean-panel"
                        style={{
                            padding: '24px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            transition: 'transform 0.3s, box-shadow 0.3s',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        }}
                    >
                        <h3 style={{
                            fontSize: '1.3rem',
                            color: 'var(--primary)',
                            marginBottom: '12px',
                            fontFamily: 'var(--font-heading)'
                        }}>
                            {project.title}
                        </h3>
                        <p style={{
                            fontSize: '0.95rem',
                            lineHeight: '1.6',
                            color: 'var(--on-bg)',
                            marginBottom: '16px'
                        }}>
                            {project.description}
                        </p>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px'
                        }}>
                            {project.technologies.map((tech, idx) => (
                                <span 
                                    key={idx}
                                    style={{
                                        backgroundColor: 'var(--primary)',
                                        color: 'white',
                                        padding: '4px 12px',
                                        borderRadius: '16px',
                                        fontSize: '0.8rem',
                                        fontWeight: '600'
                                    }}
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Projects;
