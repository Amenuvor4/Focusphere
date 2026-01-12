const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 bg-white -z-10">
      <div className="absolute inset-0">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1200 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Blue neon pulses for white background */}
            <radialGradient id="neonPulse1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(37,99,235,1)" />
              <stop offset="30%" stopColor="rgba(59,130,246,0.9)" />
              <stop offset="70%" stopColor="rgba(96,165,250,0.7)" />
              <stop offset="100%" stopColor="rgba(147,197,253,0)" />
            </radialGradient>
            <radialGradient id="neonPulse2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(29,78,216,1)" />
              <stop offset="25%" stopColor="rgba(59,130,246,0.9)" />
              <stop offset="60%" stopColor="rgba(96,165,250,0.7)" />
              <stop offset="100%" stopColor="rgba(147,197,253,0)" />
            </radialGradient>
            <radialGradient id="neonPulse3" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(6,182,212,1)" />
              <stop offset="35%" stopColor="rgba(34,211,238,0.9)" />
              <stop offset="75%" stopColor="rgba(103,232,249,0.6)" />
              <stop offset="100%" stopColor="rgba(165,243,252,0)" />
            </radialGradient>

            {/* Hero text background (subtle blue glow) */}
            <radialGradient id="heroTextBg" cx="30%" cy="50%" r="70%">
              <stop offset="0%" stopColor="rgba(219,234,254,0.4)" />
              <stop offset="40%" stopColor="rgba(191,219,254,0.2)" />
              <stop offset="80%" stopColor="rgba(147,197,253,0.1)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>

            <filter id="heroTextBlur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="15" result="blur" />
              <feTurbulence baseFrequency="0.5" numOctaves="3" result="noise" />
              <feColorMatrix in="noise" type="saturate" values="0" result="monoNoise" />
              <feComponentTransfer in="monoNoise" result="alphaAdjustedNoise">
                <feFuncA type="discrete" tableValues="0.02 0.04 0.06 0.08" />
              </feComponentTransfer>
              <feComposite in="blur" in2="alphaAdjustedNoise" operator="multiply" result="noisyBlur" />
              <feMerge>
                <feMergeNode in="noisyBlur" />
              </feMerge>
            </filter>

            {/* Thread gradients (darker blues for white background) */}
            <linearGradient id="threadFade1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,1)" />
              <stop offset="15%" stopColor="rgba(37,99,235,0.7)" />
              <stop offset="85%" stopColor="rgba(37,99,235,0.7)" />
              <stop offset="100%" stopColor="rgba(255,255,255,1)" />
            </linearGradient>
            <linearGradient id="threadFade2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,1)" />
              <stop offset="12%" stopColor="rgba(59,130,246,0.6)" />
              <stop offset="88%" stopColor="rgba(59,130,246,0.6)" />
              <stop offset="100%" stopColor="rgba(255,255,255,1)" />
            </linearGradient>
            <linearGradient id="threadFade3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,1)" />
              <stop offset="18%" stopColor="rgba(6,182,212,0.7)" />
              <stop offset="82%" stopColor="rgba(6,182,212,0.7)" />
              <stop offset="100%" stopColor="rgba(255,255,255,1)" />
            </linearGradient>

            <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g>
            {/* Hero text background glow */}
            <ellipse cx="300" cy="350" rx="400" ry="200" fill="url(#heroTextBg)" filter="url(#heroTextBlur)" opacity="0.8" />
            <ellipse cx="350" cy="320" rx="500" ry="250" fill="url(#heroTextBg)" filter="url(#heroTextBlur)" opacity="0.6" />
            <ellipse cx="400" cy="300" rx="600" ry="300" fill="url(#heroTextBg)" filter="url(#heroTextBlur)" opacity="0.4" />

            {/* 36 animated threads */}
            <path id="thread1" d="M50 720 Q200 590 350 540 Q500 490 650 520 Q800 550 950 460 Q1100 370 1200 340" stroke="url(#threadFade1)" strokeWidth="1.2" fill="none" opacity="0.8" />
            <circle r="2.5" fill="url(#neonPulse1)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="4s" repeatCount="indefinite"><mpath href="#thread1" /></animateMotion>
            </circle>

            <path id="thread2" d="M80 730 Q250 620 400 570 Q550 520 700 550 Q850 580 1000 490 Q1150 400 1300 370" stroke="url(#threadFade2)" strokeWidth="1.8" fill="none" opacity="0.7" />
            <circle r="3.5" fill="url(#neonPulse2)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="5s" repeatCount="indefinite"><mpath href="#thread2" /></animateMotion>
            </circle>

            <path id="thread3" d="M20 710 Q180 580 320 530 Q460 480 600 510 Q740 540 880 450 Q1020 360 1200 330" stroke="url(#threadFade3)" strokeWidth="1.5" fill="none" opacity="0.8" />
            <circle r="3" fill="url(#neonPulse1)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="4.5s" repeatCount="indefinite"><mpath href="#thread3" /></animateMotion>
            </circle>

            <path id="thread4" d="M120 740 Q280 640 450 590 Q620 540 770 570 Q920 600 1070 510 Q1220 420 1350 390" stroke="url(#threadFade1)" strokeWidth="0.9" fill="none" opacity="0.6" />
            <circle r="2" fill="url(#neonPulse3)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="5.5s" repeatCount="indefinite"><mpath href="#thread4" /></animateMotion>
            </circle>

            <path id="thread5" d="M60 725 Q220 600 380 550 Q540 500 680 530 Q820 560 960 470 Q1100 380 1280 350" stroke="url(#threadFade2)" strokeWidth="1.3" fill="none" opacity="0.7" />
            <circle r="2.8" fill="url(#neonPulse2)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="4.2s" repeatCount="indefinite"><mpath href="#thread5" /></animateMotion>
            </circle>

            <path id="thread6" d="M150 735 Q300 660 480 610 Q660 560 800 590 Q940 620 1080 530 Q1220 440 1400 410" stroke="url(#threadFade3)" strokeWidth="1.6" fill="none" opacity="0.6" />
            <circle r="3.2" fill="url(#neonPulse1)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="5.2s" repeatCount="indefinite"><mpath href="#thread6" /></animateMotion>
            </circle>

            <path id="thread7" d="M40 715 Q190 585 340 535 Q490 485 630 515 Q770 545 910 455 Q1050 365 1250 335" stroke="url(#threadFade1)" strokeWidth="1.1" fill="none" opacity="0.8" />
            <circle r="2.5" fill="url(#neonPulse3)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="4.8s" repeatCount="indefinite"><mpath href="#thread7" /></animateMotion>
            </circle>

            <path id="thread8" d="M100 728 Q260 630 420 580 Q580 530 720 560 Q860 590 1000 500 Q1140 410 1320 380" stroke="url(#threadFade2)" strokeWidth="1.7" fill="none" opacity="0.7" />
            <circle r="3.5" fill="url(#neonPulse2)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="5.8s" repeatCount="indefinite"><mpath href="#thread8" /></animateMotion>
            </circle>

            <path id="thread9" d="M30 722 Q170 595 310 545 Q450 495 590 525 Q730 555 870 465 Q1010 375 1180 345" stroke="url(#threadFade3)" strokeWidth="0.8" fill="none" opacity="0.6" />
            <circle r="1.8" fill="url(#neonPulse1)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="6s" repeatCount="indefinite"><mpath href="#thread9" /></animateMotion>
            </circle>

            <path id="thread10" d="M90 732 Q240 625 390 575 Q540 525 680 555 Q820 585 960 495 Q1100 405 1300 375" stroke="url(#threadFade1)" strokeWidth="1.4" fill="none" opacity="0.8" />
            <circle r="3" fill="url(#neonPulse3)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="4.3s" repeatCount="indefinite"><mpath href="#thread10" /></animateMotion>
            </circle>

            <path id="thread11" d="M70 727 Q210 605 360 555 Q510 505 650 535 Q790 565 930 475 Q1070 385 1260 355" stroke="url(#threadFade2)" strokeWidth="0.7" fill="none" opacity="0.5" />
            <circle r="1.5" fill="url(#neonPulse2)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="5.7s" repeatCount="indefinite"><mpath href="#thread11" /></animateMotion>
            </circle>

            <path id="thread12" d="M110 738 Q270 645 430 595 Q590 545 730 575 Q870 605 1010 515 Q1150 425 1380 395" stroke="url(#threadFade3)" strokeWidth="1.8" fill="none" opacity="0.7" />
            <circle r="3.8" fill="url(#neonPulse1)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="4.7s" repeatCount="indefinite"><mpath href="#thread12" /></animateMotion>
            </circle>

            <path id="thread13" d="M45 718 Q185 588 325 538 Q465 488 605 518 Q745 548 885 458 Q1025 368 1220 338" stroke="url(#threadFade1)" strokeWidth="1" fill="none" opacity="0.6" />
            <circle r="2.2" fill="url(#neonPulse3)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="5.3s" repeatCount="indefinite"><mpath href="#thread13" /></animateMotion>
            </circle>

            <path id="thread14" d="M130 721 Q290 630 460 580 Q630 530 770 560 Q910 590 1050 500 Q1190 410 1350 380" stroke="url(#threadFade2)" strokeWidth="1.3" fill="none" opacity="0.8" />
            <circle r="2.9" fill="url(#neonPulse2)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="4.9s" repeatCount="indefinite"><mpath href="#thread14" /></animateMotion>
            </circle>

            <path id="thread15" d="M25 713 Q165 583 305 533 Q445 483 585 513 Q725 543 865 453 Q1005 363 1200 333" stroke="url(#threadFade3)" strokeWidth="0.6" fill="none" opacity="0.4" />
            <circle r="1.2" fill="url(#neonPulse1)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="6.2s" repeatCount="indefinite"><mpath href="#thread15" /></animateMotion>
            </circle>

            <path id="thread16" d="M85 719 Q235 605 385 555 Q535 505 675 535 Q815 565 955 475 Q1095 385 1320 355" stroke="url(#threadFade1)" strokeWidth="1.8" fill="none" opacity="0.9" />
            <circle r="3.8" fill="url(#neonPulse2)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="4.1s" repeatCount="indefinite"><mpath href="#thread16" /></animateMotion>
            </circle>

            <path id="thread17" d="M50 720 Q180 660 320 620 Q460 580 600 600 Q740 620 880 560 Q1020 500 1200 340" stroke="url(#threadFade2)" strokeWidth="0.9" fill="none" opacity="0.5" />
            <circle r="2" fill="url(#neonPulse1)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="5.1s" repeatCount="indefinite"><mpath href="#thread17" /></animateMotion>
            </circle>

            <path id="thread18" d="M50 720 Q200 680 350 640 Q500 600 650 620 Q800 640 950 580 Q1100 520 1200 340" stroke="url(#threadFade3)" strokeWidth="1.5" fill="none" opacity="0.7" />
            <circle r="3.2" fill="url(#neonPulse2)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="4.6s" repeatCount="indefinite"><mpath href="#thread18" /></animateMotion>
            </circle>

            <path id="thread19" d="M50 720 Q160 670 280 630 Q400 590 540 610 Q680 630 820 570 Q960 510 1200 340" stroke="url(#threadFade1)" strokeWidth="1.1" fill="none" opacity="0.6" />
            <circle r="2.5" fill="url(#neonPulse3)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="5.4s" repeatCount="indefinite"><mpath href="#thread19" /></animateMotion>
            </circle>

            <path id="thread20" d="M50 720 Q220 690 380 650 Q540 610 680 630 Q820 650 960 590 Q1100 530 1200 340" stroke="url(#threadFade2)" strokeWidth="1.7" fill="none" opacity="0.8" />
            <circle r="3.5" fill="url(#neonPulse1)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="4.4s" repeatCount="indefinite"><mpath href="#thread20" /></animateMotion>
            </circle>

            {/* Threads 21-36 */}
            <path id="thread21" d="M50 720 Q170 675 300 635 Q430 595 570 615 Q710 635 850 575 Q990 515 1200 340" stroke="url(#threadFade3)" strokeWidth="0.8" fill="none" opacity="0.4" />
            <circle r="1.8" fill="url(#neonPulse2)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="5.9s" repeatCount="indefinite"><mpath href="#thread21" /></animateMotion>
            </circle>

            <path id="thread22" d="M50 720 Q190 745 340 705 Q490 665 630 685 Q770 705 910 645 Q1050 585 1200 340" stroke="url(#threadFade1)" strokeWidth="1.4" fill="none" opacity="0.7" />
            <circle r="3" fill="url(#neonPulse3)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="4.8s" repeatCount="indefinite"><mpath href="#thread22" /></animateMotion>
            </circle>

            <path id="thread23" d="M50 720 Q150 725 270 685 Q390 645 530 665 Q670 685 810 625 Q950 565 1200 340" stroke="url(#threadFade2)" strokeWidth="1.2" fill="none" opacity="0.6" />
            <circle r="2.8" fill="url(#neonPulse1)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="5.2s" repeatCount="indefinite"><mpath href="#thread23" /></animateMotion>
            </circle>

            <path id="thread24" d="M50 720 Q210 755 370 715 Q530 675 670 695 Q810 715 950 655 Q1090 595 1200 340" stroke="url(#threadFade3)" strokeWidth="1.6" fill="none" opacity="0.8" />
            <circle r="3.4" fill="url(#neonPulse2)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="4.2s" repeatCount="indefinite"><mpath href="#thread24" /></animateMotion>
            </circle>

            <path id="thread25" d="M50 720 Q165 730 290 690 Q415 650 555 670 Q695 690 835 630 Q975 570 1200 340" stroke="url(#threadFade1)" strokeWidth="1" fill="none" opacity="0.5" />
            <circle r="2.2" fill="url(#neonPulse3)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="5.6s" repeatCount="indefinite"><mpath href="#thread25" /></animateMotion>
            </circle>

            <path id="thread26" d="M50 720 Q230 760 390 720 Q550 680 690 700 Q830 720 970 660 Q1110 600 1200 340" stroke="url(#threadFade2)" strokeWidth="1.3" fill="none" opacity="0.7" />
            <circle r="2.9" fill="url(#neonPulse1)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="4.7s" repeatCount="indefinite"><mpath href="#thread26" /></animateMotion>
            </circle>

            <path id="thread27" d="M50 720 Q175 740 310 700 Q445 660 585 680 Q725 700 865 640 Q1005 580 1200 340" stroke="url(#threadFade3)" strokeWidth="0.7" fill="none" opacity="0.4" />
            <circle r="1.5" fill="url(#neonPulse2)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="6.1s" repeatCount="indefinite"><mpath href="#thread27" /></animateMotion>
            </circle>

            <path id="thread28" d="M50 720 Q195 750 350 710 Q505 670 645 690 Q785 710 925 650 Q1065 590 1200 340" stroke="url(#threadFade1)" strokeWidth="1.8" fill="none" opacity="0.9" />
            <circle r="3.7" fill="url(#neonPulse3)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="4.3s" repeatCount="indefinite"><mpath href="#thread28" /></animateMotion>
            </circle>

            <path id="thread29" d="M50 720 Q155 735 285 695 Q415 655 555 675 Q695 695 835 635 Q975 575 1200 340" stroke="url(#threadFade2)" strokeWidth="1.1" fill="none" opacity="0.6" />
            <circle r="2.5" fill="url(#neonPulse1)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="5.3s" repeatCount="indefinite"><mpath href="#thread29" /></animateMotion>
            </circle>

            <path id="thread30" d="M50 720 Q215 765 375 725 Q535 685 675 705 Q815 725 955 665 Q1095 605 1200 340" stroke="url(#threadFade3)" strokeWidth="1.5" fill="none" opacity="0.8" />
            <circle r="3.2" fill="url(#neonPulse2)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="4.5s" repeatCount="indefinite"><mpath href="#thread30" /></animateMotion>
            </circle>

            <path id="thread31" d="M50 720 Q185 745 325 705 Q465 665 605 685 Q745 705 885 645 Q1025 585 1200 340" stroke="url(#threadFade1)" strokeWidth="0.9" fill="none" opacity="0.5" />
            <circle r="2" fill="url(#neonPulse3)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="5.8s" repeatCount="indefinite"><mpath href="#thread31" /></animateMotion>
            </circle>

            <path id="thread32" d="M50 720 Q205 755 365 715 Q525 675 665 695 Q805 715 945 655 Q1085 595 1200 340" stroke="url(#threadFade2)" strokeWidth="1.7" fill="none" opacity="0.8" />
            <circle r="3.5" fill="url(#neonPulse1)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="4.1s" repeatCount="indefinite"><mpath href="#thread32" /></animateMotion>
            </circle>

            <path id="thread33" d="M50 720 Q160 730 295 690 Q430 650 570 670 Q710 690 850 630 Q990 570 1200 340" stroke="url(#threadFade3)" strokeWidth="1.2" fill="none" opacity="0.6" />
            <circle r="2.7" fill="url(#neonPulse2)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="5.1s" repeatCount="indefinite"><mpath href="#thread33" /></animateMotion>
            </circle>

            <path id="thread34" d="M50 720 Q225 770 385 730 Q545 690 685 710 Q825 730 965 670 Q1105 610 1200 340" stroke="url(#threadFade1)" strokeWidth="1.4" fill="none" opacity="0.7" />
            <circle r="3.1" fill="url(#neonPulse3)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="4.9s" repeatCount="indefinite"><mpath href="#thread34" /></animateMotion>
            </circle>

            <path id="thread35" d="M50 720 Q170 740 305 700 Q440 660 580 680 Q720 700 860 640 Q1000 580 1200 340" stroke="url(#threadFade2)" strokeWidth="0.6" fill="none" opacity="0.4" />
            <circle r="1.2" fill="url(#neonPulse1)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="6.3s" repeatCount="indefinite"><mpath href="#thread35" /></animateMotion>
            </circle>

            <path id="thread36" d="M50 720 Q240 715 400 675 Q560 635 700 655 Q840 675 980 615 Q1120 555 1200 340" stroke="url(#threadFade3)" strokeWidth="1.8" fill="none" opacity="0.9" />
            <circle r="3.8" fill="url(#neonPulse2)" opacity="1" filter="url(#neonGlow)">
              <animateMotion dur="4.0s" repeatCount="indefinite"><mpath href="#thread36" /></animateMotion>
            </circle>
          </g>
        </svg>
      </div>
    </div>
  )
}

export default AnimatedBackground