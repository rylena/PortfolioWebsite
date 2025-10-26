if (window.innerWidth > 768) {
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

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

document.addEventListener('click', function(e) {
    const nav = document.querySelector('.navbar');
    const navLinks = document.querySelector('.nav-links');
    if (!nav.contains(e.target) && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
    }
});

function copyEmail(event) {
    event.preventDefault();
    const email = 'rylen.anil@gmail.com';
    
    navigator.clipboard.writeText(email).then(function() {
        showToast();
    }).catch(function(err) {
        console.error('Could not copy email: ', err);
        alert('Email: ' + email);
    });
}

function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    
    setTimeout(function() {
        toast.classList.remove('show');
    }, 3000);
}
