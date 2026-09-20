const links = document.querySelectorAll('header nav a');
const sections = document.querySelectorAll('section');
const toggle = document.getElementById('menu-toggle');
const nav = document.getElementById('nav-menu');

links.forEach(link => {
    link.addEventListener('click', () => {
        const target = link.getAttribute('data-target');

        sections.forEach(sec => {
            sec.classList.toggle('active', sec.id === target);
        });

        links.forEach(l => {
            l.classList.toggle('active', l === link);
        });

        if (nav) {
            nav.classList.remove('show');
        }
    });
});

if (toggle && nav) {
    toggle.addEventListener('click', () => {
        nav.classList.toggle('show');
        toggle.classList.toggle('active');
    });
}
