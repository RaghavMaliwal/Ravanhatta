(function() {
      const stick = document.getElementById('stick');
      const sitar = document.getElementById('sitar');
      const audio = document.getElementById('sitarAudio');
      const audioStatus = document.getElementById('audioStatus');
      const playBtn = document.getElementById('playBtn');
      const pauseBtn = document.getElementById('pauseBtn');
      const stopBtn = document.getElementById('stopBtn');
      const autoPlayCheck = document.getElementById('autoPlayCheck');

      if (!stick || !sitar || !audio) {
        console.error('Required elements not found');
        return;
      }

      let isScrolling = false;
      let scrollTimeout;
      let lastScrollTop = 0;
      let isAutoPlayEnabled = true;

      const ANIMATION_CYCLES = 5;
      const MOVEMENT_RANGE = 250;
      const BASE_ROTATION = 20;

      // Label visibility control
      const labelElements = {
        bow: {
          hotspot: document.getElementById('hotspot-bow'),
          label: document.getElementById('label-bow'),
          arrow: document.getElementById('arrow-bow'),
          triggerPosition: 0.15, // 15% of scroll height
          delayTimeout: null,
          isVisible: false
        },
        pegs: {
          hotspot: document.getElementById('hotspot-pegs'),
          label: document.getElementById('label-pegs'),
          arrow: document.getElementById('arrow-pegs'),
          triggerPosition: 0.45, // 25% of scroll height
          delayTimeout: null,
          isVisible: false
        },
        resonator: {
          hotspot: document.getElementById('hotspot-resonator'),
          label: document.getElementById('label-resonator'),
          arrow: document.getElementById('arrow-resonator'),
          triggerPosition: 0.75, // 75% of scroll height
          delayTimeout: null,
          isVisible: false
        }
      };

      function updateAudioStatus(status, className) {
        audioStatus.textContent = status;
        audioStatus.className = `audio-status ${className}`;
      }

      function startAudio() {
        if (isAutoPlayEnabled && !isScrolling) {
          audio.play().then(() => {
            isScrolling = true;
            updateAudioStatus('Playing (Scrolling)', 'status-playing');
          }).catch(error => {
            console.error('Failed to play audio:', error);
            updateAudioStatus('Error playing', 'status-stopped');
          });
        }
      }

      function stopAudio() {
        if (isScrolling) {
          audio.pause();
          isScrolling = false;
          updateAudioStatus('Stopped', 'status-stopped');
        }
      }

      function updateLabelVisibility() {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollProgress = window.scrollY / scrollHeight;
        
        Object.keys(labelElements).forEach(key => {
          const element = labelElements[key];
          const shouldShow = scrollProgress >= element.triggerPosition;
          
          if (shouldShow && !element.isVisible) {
            // Clear any existing timeout
            if (element.delayTimeout) {
              clearTimeout(element.delayTimeout);
            }
            
            // Set delay before showing (1.5 seconds)
            element.delayTimeout = setTimeout(() => {
              element.hotspot.classList.add('visible');
              element.label.classList.add('visible');
              element.arrow.classList.add('visible');
              element.isVisible = true;
            }, 100);
            
          } else if (!shouldShow && element.isVisible) {
            // Hide immediately when scrolling back up
            if (element.delayTimeout) {
              clearTimeout(element.delayTimeout);
              element.delayTimeout = null;
            }
            element.hotspot.classList.remove('visible');
            element.label.classList.remove('visible');
            element.arrow.classList.remove('visible');
            element.isVisible = false;
          }
        });
      }

      function handleScroll() {
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (Math.abs(currentScrollTop - lastScrollTop) > 5) {
          lastScrollTop = currentScrollTop;
          if (scrollTimeout) clearTimeout(scrollTimeout);
          if (!isScrolling && isAutoPlayEnabled) startAudio();
          scrollTimeout = setTimeout(() => {
            if (isAutoPlayEnabled) stopAudio();
          }, 150);
        }
        updateAnimation();
        updateLabelVisibility();
      }

      const updateAnimation = () => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollHeight <= 0) {
          stick.style.transform = `rotate(${BASE_ROTATION}deg) translateY(0px)`;
          return;
        }
        const scrollProgress = window.scrollY / scrollHeight;
        const cycleProgress = (scrollProgress * ANIMATION_CYCLES) % 1;
        let movementY;
        if (cycleProgress < 0.5) {
          const phase = cycleProgress * 2;
          const easePhase = Math.sin(phase * Math.PI * 0.5);
          movementY = -easePhase * MOVEMENT_RANGE;
        } else {
          const phase = (cycleProgress - 0.5) * 2;
          const easePhase = Math.sin(phase * Math.PI * 0.5);
          movementY = -(1 - easePhase) * MOVEMENT_RANGE;
        }
        stick.style.transform = `rotate(${BASE_ROTATION}deg) translateY(${movementY}px)`;
      };

      const checkImagesLoaded = () => {
        if (sitar.complete && stick.complete) {
          updateAnimation();
        } else {
          sitar.addEventListener('load', updateAnimation);
          stick.addEventListener('load', updateAnimation);
          sitar.addEventListener('error', () => console.error('Failed to load sitar.png'));
          stick.addEventListener('error', () => console.error('Failed to load stick.png'));
        }
      };

      playBtn.addEventListener('click', () => {
        audio.play().then(() => {
          updateAudioStatus('Playing (Manual)', 'status-playing');
        }).catch(error => {
          console.error('Failed to play audio:', error);
          updateAudioStatus('Error playing', 'status-stopped');
        });
      });

      pauseBtn.addEventListener('click', () => {
        audio.pause();
        updateAudioStatus('Paused', 'status-stopped');
      });

      stopBtn.addEventListener('click', () => {
        audio.pause();
        audio.currentTime = 0;
        updateAudioStatus('Stopped', 'status-stopped');
      });

      autoPlayCheck.addEventListener('change', (e) => {
        isAutoPlayEnabled = e.target.checked;
        if (!isAutoPlayEnabled) stopAudio();
      });

      checkImagesLoaded();
      updateLabelVisibility(); // Set initial label visibility
      window.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', updateAnimation);
    })();

