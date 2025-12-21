import { Link } from "react-router-dom"
import { BarChart3, Calendar, Settings, Github, Mail, ArrowRight, Menu, X } from "lucide-react"
import { useState } from "react"

const HomePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background - White with Blue Streaks */}
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

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 lg:px-12">
        <div className="flex items-center space-x-2 pl-3 sm:pl-6 lg:pl-12">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent"> <a href="#home">Focusphere</a></h1>
        </div>

        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
          <a href="#features" className="text-blue-700 hover:text-blue-900 transition-colors text-sm lg:text-base">Features</a>
          <a href="#about" className="text-blue-700 hover:text-blue-900 transition-colors text-sm lg:text-base">About</a>
          <a href="#faq" className="text-blue-700 hover:text-blue-900 transition-colors text-sm lg:text-base">FAQ</a>
          <Link to="/Auth" className="text-blue-700 hover:text-blue-900 transition-colors text-sm lg:text-base">Login</Link>
        </nav>

        <button className="md:hidden text-blue-700 p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <Link
          to="/Auth?mode=signup"
          className="hidden md:flex bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-4 lg:px-6 py-2 rounded-xl text-sm lg:text-base font-medium shadow-lg transition-all duration-300 hover:scale-105"
        >
          Sign Up
        </Link>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-blue-200 z-20 shadow-lg">
          <nav className="flex flex-col space-y-4 px-6 py-6">
            <a href="#home" className="text-blue-700 hover:text-blue-900 transition-colors">Home</a>
            <a href="#features" className="text-blue-700 hover:text-blue-900 transition-colors">Features</a>
            <a href="#about" className="text-blue-700 hover:text-blue-900 transition-colors">About</a>
            <a href="#faq" className="text-blue-700 hover:text-blue-900 transition-colors">FAQ</a>
            <Link to="/Auth" className="text-blue-700 hover:text-blue-900 transition-colors">Login</Link>
            <Link
              to="/Auth?mode=signup"
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow-lg w-fit"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      )}

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-start justify-center min-h-[calc(100vh-80px)] px-6 sm:px-12 lg:px-20 max-w-6xl mt-8 sm:mt-0">
        
        {/* Pulsing Cloud Blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          {/* Large blue cloud blob */}
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse-slow"></div>
          
          {/* Medium cyan cloud blob */}
          <div className="absolute top-1/3 right-0 w-80 h-80 bg-cyan-300/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          {/* Small blue cloud blob */}
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
          
          {/* Extra accent blob */}
          <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight mb-6 sm:mb-8 text-balance bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
          Prioritize Smarter,
          <br />
          Achieve <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent italic font-light">Faster</span>
        </h1>

        <p className="text-blue-700 text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-10 max-w-2xl text-pretty leading-relaxed">
          Welcome to Focusphere – your AI-powered task prioritization tool.
          <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>
          Focus on what matters most with smart prioritization made simple.
        </p>

        <Link
          to="/Auth?mode=signup"
          className="group relative bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base md:text-xs lg:text-lg font-semibold flex items-center gap-2 backdrop-blur-sm border border-blue-500/30 shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-600/40 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
        >
          Get Started
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 group-hover:-rotate-12 transition-transform duration-300" />
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>
      </main>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 sm:py-32 bg-white/95 backdrop-blur-sm overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6">
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-block mb-4">
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider px-4 py-2 bg-blue-100/80 rounded-full">
                Features
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-900 via-blue-700 to-cyan-600 bg-clip-text text-transparent">
              Why Choose Focusphere?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover powerful features designed to transform your productivity and help you focus on what truly matters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {[
              {
                icon: <BarChart3 className="w-10 h-10" />,
                title: "AI-Powered Prioritization",
                description: "Our advanced AI analyzes your behavior and deadlines to optimize your task list intelligently.",
                gradient: "from-blue-500 to-blue-600",
                glowColor: "blue"
              },
              {
                icon: <Calendar className="w-10 h-10" />,
                title: "Efficient Planning",
                description: "Plan your tasks more effectively with our intuitive calendar integration and smart scheduling.",
                gradient: "from-cyan-500 to-blue-500",
                glowColor: "cyan"
              },
              {
                icon: <Settings className="w-10 h-10" />,
                title: "Seamless Integration",
                description: "Sync effortlessly across all your devices for a unified and consistent productivity experience.",
                gradient: "from-blue-600 to-cyan-500",
                glowColor: "blue"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 lg:p-10 rounded-3xl bg-white border-2 border-blue-100 hover:border-blue-300 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-3"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon container with glow effect */}
                  <div className="relative mb-6 inline-block">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500`}></div>
                    <div className={`relative p-5 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                      {feature.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-base">
                    {feature.description}
                  </p>
                  
                </div>

                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-transparent rounded-bl-full rounded-tr-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 py-24 sm:py-32 bg-gradient-to-br from-blue-50/90 to-cyan-50/90 backdrop-blur-sm overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6">
          <div className="flex justify-center lg:flex-row items-center gap-12 lg:gap-16">

            {/* Content Side */}
            <div className="lg:w-1/2 w-full">
              <div className="inline-block mb-4">
                <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full">
                  About Us
                </span>
              </div>
              
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-cyan-700 bg-clip-text text-transparent leading-tight">
                Powered by Advanced AI
              </h2>
              
              <p className="text-xl mb-8 text-gray-700 leading-relaxed">
                Focusphere uses cutting-edge machine learning to analyze your work patterns and optimize your
                productivity. Stay focused and achieve more with our intelligent task management system.
              </p>
              
              <ul className="space-y-5 mb-8">
                {[
                  {
                    text: "Smart task prioritization based on deadlines and importance",
                    icon: "✓"
                  },
                  {
                    text: "Personalized recommendations that adapt to your work style",
                    icon: "✓"
                  },
                  {
                    text: "Automated task creation and scheduling suggestions",
                    icon: "✓"
                  },
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-4 group">
                    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700 text-lg leading-relaxed flex-1">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 py-24 sm:py-32 bg-gradient-to-br from-blue-50/90 to-cyan-50/90 backdrop-blur-sm overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full">
                FAQ
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-cyan-700 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Got questions? We've got answers. Here are some common questions about Focusphere.
            </p>
          </div>

          {/* FAQ Grid */}
          <div className="max-w-4xl mx-auto grid grid-cols-1 gap-6">
            {[
              {
                question: "What is Focusphere?",
                answer: "Focusphere is an AI-powered task prioritization tool that helps you focus on what matters most. It uses advanced machine learning to analyze your tasks and deadlines, automatically organizing them by priority so you can achieve more in less time."
              },
              {
                question: "How does the AI prioritization work?",
                answer: "Our AI analyzes multiple factors including deadlines, task importance, your work patterns, and dependencies between tasks. It then creates an optimized schedule that helps you tackle the most critical items first, ensuring nothing falls through the cracks."
              },
              {
                question: "Is my data secure?",
                answer: "Absolutely. We use industry-standard encryption to protect your data both in transit and at rest. Your tasks and information are private and only accessible to you. We never share your data with third parties."
              },
              {
                question: "Can I use Focusphere on mobile?",
                answer: "Yes! Focusphere works seamlessly across all your devices. Whether you're on desktop, tablet, or mobile, your tasks sync automatically so you can stay productive anywhere."
              },
              {
                question: "Can I integrate Focusphere with other tools?",
                answer: "Yes! Focusphere integrates with popular productivity tools and calendar apps to fit seamlessly into your existing workflow. Connect your favorite apps and let Focusphere bring everything together."
              }
            ].map((faq, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-6 lg:p-8 border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors duration-300">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          {/* CTA at bottom of FAQ */}
          <div className="text-center mt-16">
            <p className="text-gray-600 mb-6 text-lg">Still have questions?</p>
            <Link
              to="/Auth?mode=signup"
              className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white text-lg font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-gradient-to-br from-gray-900 to-slate-900 py-16 border-t border-gray-800">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Focusphere
              </h3>
              <p className="text-gray-400 mb-4 leading-relaxed">
                AI-powered task management for enhanced productivity.
              </p>
              <div className="flex space-x-4">
                <a href="#github" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Github className="w-6 h-6" />
                </a>
                <a href="#gmail" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Mail className="w-6 h-6" />
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
              <ul className="space-y-2">
                {["Features", "About", "FAQ"].map((item) => (
                  <li key={item}>
                    <a href={`#${item.toLowerCase()}`} className="text-gray-400 hover:text-blue-400 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Connect</h3>
              <p className="text-gray-400">Email: daarius24@gmail.com</p>
              <p className="text-gray-400">Phone: (123) 456-7890</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Download</h3>
              <button className="flex items-center px-4 py-2 rounded-lg border-2 border-blue-500/30 text-gray-300 hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-400 transition-all duration-300">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Chrome Extension
              </button>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400">&copy; 2025 Focusphere. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage