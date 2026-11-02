// ============================================
// COMPLETE OPTIMIZED APP.JS
// No variable conflicts, clean structure
// ============================================

(function() {
    'use strict';

    // ============================================
    // INITIALIZATION
    // ============================================
    
    // Initialize AOS
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100
    });

    // ============================================
    // PAGE LOAD & OVERFLOW FIXES
    // ============================================
    
    // Loader
    window.addEventListener('load', () => {
        setTimeout(() => {
            const loaderWrapper = document.querySelector('.loader-wrapper');
            if (loaderWrapper) {
                loaderWrapper.style.opacity = '0';
                loaderWrapper.style.visibility = 'hidden';
            }
        }, 500);

        // Fix overflow on load
        preventHorizontalScroll();
        fixOverflowElements();
        fixHeaderPosition();
    });

    // Prevent horizontal scroll
    function preventHorizontalScroll() {
        document.body.style.overflowX = 'hidden';
        document.body.style.width = '100%';
        document.documentElement.style.overflowX = 'hidden';
        document.documentElement.style.width = '100%';
    }

    // Fix any elements that might cause overflow
    function fixOverflowElements() {
        const selectors = ['.container', '.row', 'section', '.hero', '.header'];
        
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                const elementWidth = element.offsetWidth;
                const viewportWidth = window.innerWidth;
                
                if (elementWidth > viewportWidth) {
                    element.style.maxWidth = '100vw';
                    element.style.overflowX = 'hidden';
                }
            });
        });
    }

    // Ensure header stays within viewport
    function fixHeaderPosition() {
        const header = document.getElementById('header');
        if (header) {
            header.style.maxWidth = '100vw';
            header.style.width = '100%';
            header.style.left = '0';
            header.style.right = '0';
        }
    }

    // ============================================
    // HEADER SCROLL BEHAVIOR
    // ============================================
    
    const headerElement = document.getElementById('header');
    const heroOverlayElement = document.querySelector('.hero-overlay');
    const heroElement = document.querySelector('.hero');
    const heroBefore = document.querySelector('.hero::before');
    
    window.addEventListener('scroll', () => {
        const scrollPosition = window.pageYOffset;
        
        // Header background on scroll
        if (scrollPosition > 50) {
            if (headerElement) headerElement.classList.add('scrolled');
            if (heroOverlayElement) heroOverlayElement.classList.add('scrolled');
        } else {
            if (headerElement) headerElement.classList.remove('scrolled');
            if (heroOverlayElement) heroOverlayElement.classList.remove('scrolled');
        }

        // Enhanced Hero parallax effect
        const heroContent = document.querySelector('.hero-content');
        if (heroContent && scrollPosition < window.innerHeight) {
            // Parallax content - moves slower
            heroContent.style.transform = `translateY(${scrollPosition * 0.4}px)`;
            heroContent.style.opacity = Math.max(0, 1 - scrollPosition * 0.0015);
        }
        
        // Parallax background shapes
        if (heroElement && scrollPosition < window.innerHeight) {
            // Move the geometric background
            const heroBeforeElement = document.querySelector('.hero::before');
            if (window.getComputedStyle) {
                heroElement.style.setProperty('--scroll-parallax', `${scrollPosition * 0.5}px`);
            }
        }

        // Back to top button
        updateBackToTopButton(scrollPosition);
    });

    // ============================================
    // MOBILE MENU
    // ============================================
    
    const menuToggler = document.querySelector('.navbar-toggler');
    const menuCollapse = document.querySelector('.navbar-collapse');
    
    if (menuToggler && menuCollapse) {
        // Toggle menu
        menuToggler.addEventListener('click', () => {
            menuToggler.classList.toggle('active');
            
            // Prevent body scroll on mobile when menu is open
            if (window.innerWidth < 992) {
                document.body.style.overflow = menuCollapse.classList.contains('show') ? '' : 'hidden';
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            const isClickInsideMenu = menuToggler.contains(e.target) || menuCollapse.contains(e.target);
            
            if (!isClickInsideMenu && menuCollapse.classList.contains('show')) {
                menuCollapse.classList.remove('show');
                menuToggler.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Close menu when clicking a link
        const menuLinks = document.querySelectorAll('.navbar-nav .nav-link');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 992) {
                    setTimeout(() => {
                        menuCollapse.classList.remove('show');
                        menuToggler.classList.remove('active');
                        document.body.style.overflow = '';
                    }, 300);
                }
            });
        });
    }

    // ============================================
    // SMOOTH SCROLLING & ACTIVE LINKS
    // ============================================
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = headerElement ? headerElement.offsetHeight : 0;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active navigation link on scroll
    const allSections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    window.addEventListener('scroll', () => {
        let currentSection = '';
        
        allSections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            const scrollPos = window.pageYOffset;
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkHref = link.getAttribute('href').substring(1);
            if (linkHref === currentSection) {
                link.classList.add('active');
            }
        });
    });

    // ============================================
    // COUNTER ANIMATION
    // ============================================
    
    const counterElements = document.querySelectorAll('[data-counter]');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const targetValue = parseInt(counter.getAttribute('data-counter'));
                const animationDuration = 2000;
                const incrementValue = targetValue / (animationDuration / 16);
                let currentValue = 0;
                
                const animateCounter = () => {
                    currentValue += incrementValue;
                    if (currentValue < targetValue) {
                        counter.textContent = Math.floor(currentValue);
                        requestAnimationFrame(animateCounter);
                    } else {
                        counter.textContent = targetValue;
                        const labelText = counter.parentElement.querySelector('.stat-label').textContent;
                        if (labelText.includes('%')) {
                            counter.textContent += '%';
                        } else if (labelText.includes('+')) {
                            counter.textContent += '+';
                        }
                    }
                };
                
                animateCounter();
                counterObserver.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    
    counterElements.forEach(counter => counterObserver.observe(counter));

    // ============================================
    // TESTIMONIALS SLIDER
    // ============================================
    
    const testimonialSlider = document.querySelector('.testimonial-slider');
    if (testimonialSlider) {
        new Swiper('.testimonial-slider', {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            breakpoints: {
                768: {
                    slidesPerView: 2,
                },
                1024: {
                    slidesPerView: 3,
                }
            }
        });
    }

    // ============================================
    // FAQ ACCORDION
    // ============================================
    
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (question && answer) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                        const otherAnswer = otherItem.querySelector('.faq-answer');
                        if (otherAnswer) {
                            otherAnswer.style.maxHeight = null;
                        }
                    }
                });
                
                // Toggle current item
                if (!isActive) {
                    item.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                } else {
                    item.classList.remove('active');
                    answer.style.maxHeight = null;
                }
            });
        }
    });

    // ============================================
    // BACK TO TOP BUTTON
    // ============================================
    
    const backToTopBtn = document.getElementById('backToTop');
    const progressCircle = document.querySelector('.progress-ring-circle');
    
    if (progressCircle) {
        const radius = progressCircle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        
        progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
        progressCircle.style.strokeDashoffset = circumference;
    }

    function setProgress(percent) {
        if (progressCircle) {
            const radius = progressCircle.r.baseVal.value;
            const circumference = radius * 2 * Math.PI;
            const offset = circumference - (percent / 100) * circumference;
            progressCircle.style.strokeDashoffset = offset;
        }
    }

    function updateBackToTopButton(scrollPos) {
        if (!backToTopBtn) return;
        
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollPos / docHeight) * 100;
        
        // Show/hide button
        if (scrollPos > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
        
        // Update progress ring
        setProgress(scrollPercent);
        
        // Adjust position if near footer
        const footer = document.querySelector('.footer');
        if (footer) {
            const footerRect = footer.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            if (footerRect.top < windowHeight) {
                const overlap = windowHeight - footerRect.top;
                backToTopBtn.style.bottom = Math.max(20, overlap + 20) + 'px';
            } else {
                backToTopBtn.style.bottom = '20px';
            }
        }
    }
    
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ============================================
    // CONTACT FORM SUBMISSION
    // ============================================
    
    const contactFormElement = document.getElementById('contactForm');
    
    if (contactFormElement) {
        contactFormElement.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitButton = contactFormElement.querySelector('button[type="submit"]');
            if (!submitButton) return;
            
            const originalButtonText = submitButton.innerHTML;
            
            // Show success message
            submitButton.innerHTML = '<i class="fas fa-check"></i> Richiesta Inviata!';
            submitButton.style.background = 'linear-gradient(135deg, #28a745 0%, #218838 100%)';
            submitButton.disabled = true;
            
            // Reset after 3 seconds
            setTimeout(() => {
                submitButton.innerHTML = originalButtonText;
                submitButton.style.background = '';
                submitButton.disabled = false;
                contactFormElement.reset();
            }, 3000);
        });
    }

    // ============================================
    // WINDOW RESIZE HANDLER
    // ============================================
    
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            fixOverflowElements();
            fixHeaderPosition();
            
            // Close mobile menu if window is resized to desktop
            if (window.innerWidth >= 992 && menuCollapse && menuCollapse.classList.contains('show')) {
                menuCollapse.classList.remove('show');
                if (menuToggler) menuToggler.classList.remove('active');
                document.body.style.overflow = '';
            }
        }, 250);
    });

    // ============================================
    // DEBUGGING FUNCTION (Optional)
    // ============================================
    
    // Uncomment to detect overflow issues in console
    /*
    function detectOverflow() {
        const allElements = document.querySelectorAll('*');
        const overflowList = [];
        
        allElements.forEach(el => {
            if (el.scrollWidth > el.clientWidth) {
                overflowList.push({
                    element: el,
                    tag: el.tagName,
                    class: el.className,
                    scrollWidth: el.scrollWidth,
                    clientWidth: el.clientWidth,
                    difference: el.scrollWidth - el.clientWidth
                });
            }
        });
        
        if (overflowList.length > 0) {
            console.warn('Elements causing horizontal overflow:');
            console.table(overflowList);
        } else {
            console.log('No overflow detected!');
        }
    }
    
    // Run on demand
    window.detectOverflow = detectOverflow;
    // Or run automatically
    // setTimeout(detectOverflow, 2000);
    */

    // ============================================
    // FIX VIEWPORT META TAG
    // ============================================
    
    function fixViewportMeta() {
        let viewportMeta = document.querySelector("meta[name=viewport]");
        if (viewportMeta) {
            viewportMeta.setAttribute('content', 
                'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
    }
    
    fixViewportMeta();

    // ============================================
    // PROCESS - Add Step Numbers & Smooth Scroll
    // ============================================
    const processItems = document.querySelectorAll('.process-item');
    const processTimeline = document.querySelector('.process-timeline');
    
    processItems.forEach((item, index) => {
        const content = item.querySelector('.process-content');
        if (content) {
            content.setAttribute('data-step', `0${index + 1}`);
        }
    });
    
    // Smooth horizontal scroll for process timeline
    if (processTimeline) {
        let isDown = false;
        let startX;
        let scrollLeft;
        
        processTimeline.addEventListener('mousedown', (e) => {
            isDown = true;
            processTimeline.style.cursor = 'grabbing';
            startX = e.pageX - processTimeline.offsetLeft;
            scrollLeft = processTimeline.scrollLeft;
        });
        
        processTimeline.addEventListener('mouseleave', () => {
            isDown = false;
            processTimeline.style.cursor = 'grab';
        });
        
        processTimeline.addEventListener('mouseup', () => {
            isDown = false;
            processTimeline.style.cursor = 'grab';
        });
        
        processTimeline.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - processTimeline.offsetLeft;
            const walk = (x - startX) * 2;
            processTimeline.scrollLeft = scrollLeft - walk;
        });
        
        // Add grab cursor
        processTimeline.style.cursor = 'grab';
    }
    
    // ============================================
    // CONSOLE MESSAGE
    // ============================================
    
    console.log('%c🔥 HARDCORE MODE ACTIVATED!', 'color: #FF3D00; font-size: 18px; font-weight: 900; text-transform: uppercase;');
    console.log('%cNo Pain, No Gain - Stiven PT', 'color: #666; font-size: 12px;');

})();