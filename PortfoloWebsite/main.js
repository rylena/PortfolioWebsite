// Only run navbar code if screen is wider than 768px
if (window.innerWidth > 768) {
    // Change navbar background on scroll
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Smooth scroll for navigation links
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.scroll-link, .nav-links a').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                targetSection.scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
    });
}

// Add scroll reveal animations
const sections = document.querySelectorAll('section');

const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('section-visible');
        } else {
            // Optional: remove class when section is out of view for repeat animations
            // entry.target.classList.remove('section-visible');
        }
    });
}, observerOptions);

sections.forEach(section => {
    if (section.id !== 'home') {
        section.classList.add('section-hidden');
        observer.observe(section);
    }
});

document.querySelector('.menu-toggle').addEventListener('click', function() {
    document.querySelector('.nav-links').classList.toggle('active');
});

// Close menu when clicking outside
document.addEventListener('click', function(e) {
    const nav = document.querySelector('.navbar');
    const navLinks = document.querySelector('.nav-links');
    if (!nav.contains(e.target) && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
    }
});
