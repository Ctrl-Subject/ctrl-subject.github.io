const links = document.querySelectorAll('[data-target]');
const navLinks = document.querySelectorAll('header nav a');
const sections = document.querySelectorAll('section');
const toggle = document.getElementById('menu-toggle');
const nav = document.getElementById('nav-menu');


// =========================================
// SECTION NAVIGATION
// =========================================

links.forEach(link => {

    link.addEventListener('click', (event) => {

        event.preventDefault();

        const target = link.getAttribute('data-target');

        // Show selected section
        sections.forEach(section => {
            section.classList.toggle(
                'active',
                section.id === target
            );
        });


        // Update active navigation item
        navLinks.forEach(navLink => {

            navLink.classList.toggle(
                'active',
                navLink.getAttribute('data-target') === target
            );

        });


        // Close mobile menu
        if (nav) {
            nav.classList.remove('show');
        }

        if (toggle) {
            toggle.classList.remove('active');
        }


        // Scroll to top
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

    });

});


// =========================================
// MOBILE MENU
// =========================================

if (toggle && nav) {

    toggle.addEventListener('click', () => {

        nav.classList.toggle('show');
        toggle.classList.toggle('active');

    });

}