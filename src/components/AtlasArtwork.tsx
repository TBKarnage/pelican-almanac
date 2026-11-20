import type { MapRegion } from '../types/stardew';

function PineTree({ x, y, scale = 1, tint = '#2A5A2F' }: { x: number; y: number; scale?: number; tint?: string }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="14" rx="9" ry="3.5" fill="rgba(22, 34, 15, 0.28)" />
      <rect x="-2.2" y="7" width="4.4" height="7" fill="#5D3B22" rx="1" />
      <polygon points="0,-16 11,0 -11,0" fill={tint} />
      <polygon points="0,-8 12.5,8 -12.5,8" fill={tint} />
      <polygon points="0,-15 5,-2 -5,-2" fill="#467E44" opacity="0.55" />
    </g>
  );
}

function OakTree({ x, y, scale = 1, leaf = '#4B863B' }: { x: number; y: number; scale?: number; leaf?: string }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="14" rx="10" ry="3.5" fill="rgba(26, 38, 18, 0.24)" />
      <rect x="-2.5" y="4" width="5" height="10" fill="#6F472B" rx="1" />
      <circle cx="-5" cy="-1" r="8" fill={leaf} />
      <circle cx="5" cy="-1" r="8" fill={leaf} />
      <circle cx="0" cy="-7" r="9" fill="#5D9B46" />
    </g>
  );
}

function PalmTree({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <ellipse cx="2" cy="14" rx="8" ry="3" fill="rgba(35, 30, 12, 0.22)" />
      <path d="M 0 13 Q 4 1 1 -10" stroke="#855832" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M 1 -10 Q -12 -14 -17 -5" stroke="#4D8A38" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M 1 -10 Q -8 -19 -2 -23" stroke="#5EA142" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <path d="M 1 -10 Q 13 -16 17 -6" stroke="#4D8A38" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M 1 -10 Q 10 -4 14 2" stroke="#3F742E" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Cactus({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="10" rx="5" ry="2" fill="rgba(90, 52, 20, 0.24)" />
      <rect x="-3" y="-10" width="6" height="20" rx="3" fill="#467C3B" />
      <path d="M -3 -1 L -9 -1 L -9 -7" fill="none" stroke="#467C3B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 3 -4 L 9 -4 L 9 -9" fill="none" stroke="#467C3B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

function CartographicFrame({ accent = '#D8B26E', inner = '#5D4024' }: { accent?: string; inner?: string }) {
  return (
    <g pointerEvents="none">
      <rect x="2" y="2" width="1196" height="756" fill="none" stroke={inner} strokeWidth="4" />
      <rect x="8" y="8" width="1184" height="744" fill="none" stroke={accent} strokeWidth="1.6" strokeOpacity="0.72" />
      <circle cx="14" cy="14" r="3.5" fill={accent} stroke={inner} strokeWidth="1.2" />
      <circle cx="1186" cy="14" r="3.5" fill={accent} stroke={inner} strokeWidth="1.2" />
      <circle cx="14" cy="746" r="3.5" fill={accent} stroke={inner} strokeWidth="1.2" />
      <circle cx="1186" cy="746" r="3.5" fill={accent} stroke={inner} strokeWidth="1.2" />
    </g>
  );
}

function ValleyBuilding({
  x,
  y,
  w,
  h,
  roof,
  wall = '#F2DEC0',
  chimney = false,
  awning,
  dome = false,
  tower = false,
  crossSign = false,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  roof: string;
  wall?: string;
  chimney?: boolean;
  awning?: string;
  dome?: boolean;
  tower?: boolean;
  crossSign?: boolean;
}) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x={-w / 2 + 2} y={-h / 2 + 5} width={w} height={h} rx="3" fill="rgba(34, 24, 14, 0.28)" />
      {chimney && (
        <rect x={w / 4} y={-h / 2 - 12} width="7" height="12" fill="#7D5242" stroke="#43291E" strokeWidth="1.2" />
      )}
      <rect x={-w / 2} y={-h / 2 + 6} width={w} height={h - 6} rx="2" fill={wall} stroke="#593C24" strokeWidth="1.8" />
      {tower ? (
        <polygon
          points={`0,${-h / 2 - 14} ${w / 2 + 5},${-h / 2 + 8} ${-w / 2 - 5},${-h / 2 + 8}`}
          fill={roof}
          stroke="#402438"
          strokeWidth="1.8"
        />
      ) : dome ? (
        <path
          d={`M ${-w / 2 - 2} ${-h / 2 + 8} Q 0 ${-h / 2 - 18} ${w / 2 + 2} ${-h / 2 + 8} Z`}
          fill={roof}
          stroke="#5C4426"
          strokeWidth="1.8"
        />
      ) : (
        <polygon
          points={`${-w / 2 - 4},${-h / 2 + 8} ${-w / 4},${-h / 2 - 8} ${w / 4},${-h / 2 - 8} ${w / 2 + 4},${-h / 2 + 8}`}
          fill={roof}
          stroke="#4A2F1B"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      )}
      {awning && (
        <>
          <rect x={-w / 2 + 2} y={h / 2 - 6} width={w - 4} height="6" rx="1" fill={awning} stroke="#4A2F1B" strokeWidth="1" />
          <path
            d={`M ${-w / 2 + 8} ${h / 2 - 6} V ${h / 2} M ${-w / 2 + 18} ${h / 2 - 6} V ${h / 2} M ${w / 2 - 12} ${h / 2 - 6} V ${h / 2}`}
            stroke="#FFF4DC"
            strokeWidth="2"
            opacity="0.72"
          />
        </>
      )}
      <rect x="-4" y={h / 2 - 11} width="8" height="11" rx="1" fill="#6D4424" />
      {crossSign && (
        <g transform={`translate(0, ${-h / 2 + 1})`}>
          <circle cx="0" cy="0" r="5" fill="#FFFDF7" stroke="#593C24" strokeWidth="1" />
          <path d="M -3 0 H 3 M 0 -3 V 3" stroke="#C53B34" strokeWidth="2.2" />
        </g>
      )}
      {w >= 34 && (
        <>
          <rect x={-w / 2 + 5} y={-h / 2 + 12} width="7" height="6" rx="1" fill="#FCE588" stroke="#6D4424" strokeWidth="1" />
          <rect x={w / 2 - 12} y={-h / 2 + 12} width="7" height="6" rx="1" fill="#FCE588" stroke="#6D4424" strokeWidth="1" />
        </>
      )}
    </g>
  );
}

export function AtlasArtwork({ region }: { region: MapRegion }) {
  if (region === 'valley') {
    return (
      <svg
        viewBox="0 0 1200 760"
        width="1200"
        height="760"
        style={{ display: 'block', userSelect: 'none' }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="valley-meadow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#83B156" />
            <stop offset="55%" stopColor="#75A44E" />
            <stop offset="100%" stopColor="#5C8B40" />
          </linearGradient>
          <linearGradient id="valley-desert" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E5B267" />
            <stop offset="65%" stopColor="#EBC885" />
            <stop offset="100%" stopColor="#D7A35B" />
          </linearGradient>
          <linearGradient id="valley-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B93B2" />
            <stop offset="100%" stopColor="#266888" />
          </linearGradient>
          <linearGradient id="valley-beach" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EDD797" />
            <stop offset="100%" stopColor="#DFC079" />
          </linearGradient>
          <pattern id="valley-cobble" width="24" height="24" patternUnits="userSpaceOnUse">
            <rect width="24" height="24" fill="#D9BF96" />
            <rect x="2" y="2" width="9" height="8" rx="2" fill="#CAA97B" opacity="0.55" />
            <rect x="13" y="4" width="8" height="7" rx="2" fill="#E4CEAA" opacity="0.55" />
            <rect x="5" y="13" width="10" height="8" rx="2" fill="#BD9B6B" opacity="0.45" />
          </pattern>
        </defs>

        {/* Base Valley Pasture */}
        <rect width="1200" height="760" fill="url(#valley-meadow)" />

        {/* Organic Meadow Shading */}
        <ellipse cx="470" cy="400" rx="140" ry="70" fill="#8CBD60" opacity="0.32" />
        <ellipse cx="240" cy="590" rx="200" ry="120" fill="#51803B" opacity="0.4" />
        <ellipse cx="830" cy="390" rx="210" ry="110" fill="#92BA66" opacity="0.28" />

        {/* ====================================================== */}
        {/* 1. CALICO DESERT (FAR NORTHWEST) */}
        {/* ====================================================== */}
        <path
          d="M 0 0 L 340 0 L 330 148 L 288 206 L 146 226 L 0 236 Z"
          fill="url(#valley-desert)"
        />
        {/* Desert Cliff Rim */}
        <path
          d="M 0 228 L 148 218 L 290 198 L 332 142 L 342 0"
          fill="none"
          stroke="#9B5F35"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M 0 237 L 152 227 L 297 205 L 340 148 L 350 0"
          fill="none"
          stroke="#6A3B1E"
          strokeWidth="4"
        />
        {/* Red Canyon Mesas & Skull Cavern */}
        <path d="M 16 14 L 222 14 L 195 90 L 16 90 Z" fill="#BC6C42" stroke="#7A4021" strokeWidth="3" />
        <path d="M 36 22 L 195 22 L 175 72 L 36 72 Z" fill="#CF8152" opacity="0.7" />
        <g transform="translate(132, 80)">
          <ellipse cx="0" cy="-2" rx="22" ry="18" fill="#52372A" stroke="#301D14" strokeWidth="2.5" />
          <path d="M -12 10 L -12 -4 Q 0 -18 12 -4 L 12 10 Z" fill="#1E1411" />
          <circle cx="-5" cy="-8" r="2.5" fill="#E8D8BE" />
          <circle cx="5" cy="-8" r="2.5" fill="#E8D8BE" />
        </g>
        {/* Three Desert Pillars */}
        <g transform="translate(260, 58)" opacity="0.92">
          <circle cx="0" cy="6" r="14" fill="#A68232" opacity="0.35" />
          <rect x="-18" y="-12" width="7" height="22" rx="1.5" fill="#D4AC4B" stroke="#785A18" strokeWidth="1.5" />
          <rect x="-3" y="-18" width="7" height="28" rx="1.5" fill="#DFBB58" stroke="#785A18" strokeWidth="1.5" />
          <rect x="12" y="-12" width="7" height="22" rx="1.5" fill="#D4AC4B" stroke="#785A18" strokeWidth="1.5" />
        </g>
        {/* Desert Highway & Oasis */}
        <path d="M 148 168 L 246 168 L 246 125" stroke="#C5985E" strokeWidth="15" strokeLinecap="round" fill="none" />
        <ellipse cx="105" cy="182" rx="34" ry="19" fill="#3D99B5" stroke="#8F6937" strokeWidth="3" />
        <ValleyBuilding x={138} y={163} w={34} h={24} roof="#A64B38" wall="#EFD29E" awning="#D88B3E" />
        {/* Desert Trader Tent & Camel */}
        <g transform="translate(258, 118)">
          <rect x="-16" y="-8" width="32" height="14" rx="2" fill="#E8CFA0" stroke="#734824" strokeWidth="1.5" />
          <polygon points="-20,-6 20,-6 14,-16 -14,-16" fill="#B84239" stroke="#6E241E" strokeWidth="1.5" />
          <rect x="-10" y="-15" width="7" height="9" fill="#FFF2D6" />
          <rect x="3" y="-15" width="7" height="9" fill="#FFF2D6" />
          {/* Friendly Camel Silhouette */}
          <ellipse cx="26" cy="2" rx="8" ry="5" fill="#C78C4A" stroke="#70481D" strokeWidth="1.2" />
          <circle cx="33" cy="-4" r="3" fill="#C78C4A" stroke="#70481D" strokeWidth="1" />
          <path d="M 21 6 V 11 M 30 6 V 11" stroke="#70481D" strokeWidth="2" />
        </g>
        {/* Sand Dragon Skeleton & Cacti */}
        <path d="M 278 175 Q 298 167 308 180 M 285 169 L 288 181 M 295 168 L 297 181" stroke="#F4EAD2" strokeWidth="2.5" fill="none" />
        <PalmTree x={68} y={166} scale={0.92} />
        <PalmTree x={142} y={196} scale={0.82} />
        <Cactus x={220} y={88} scale={0.88} />
        <Cactus x={44} y={132} scale={0.95} />
        <text
          x="212"
          y="188"
          textAnchor="middle"
          fill="#FFF2D8"
          stroke="#6A3815"
          strokeWidth="3.2"
          paintOrder="stroke"
          fontSize="13"
          fontWeight="800"
          fontFamily="serif"
          letterSpacing="1.5"
        >
          CALICO DESERT
        </text>

        {/* ====================================================== */}
        {/* 2. NORTHERN MOUNTAINS, RAILROAD, MINES, LAKE & QUARRY */}
        {/* ====================================================== */}
        <path
          d="M 348 0 L 1200 0 L 1200 226 L 1085 218 L 990 205 L 745 208 L 485 206 L 340 148 Z"
          fill="#628647"
        />
        {/* Northern Cliff Wall & Shelf */}
        <path
          d="M 352 10 L 1186 10 L 1186 94 L 745 88 L 445 108 L 346 82 Z"
          fill="#7D7267"
        />
        <path
          d="M 350 92 L 448 112 L 748 94 L 1186 102"
          fill="none"
          stroke="#4D4339"
          strokeWidth="6"
        />
        {/* Cliff Ledge Separating Mountains from Town */}
        <path
          d="M 470 212 L 665 212 M 790 214 L 1065 214"
          fill="none"
          stroke="#6A5035"
          strokeWidth="7"
          strokeLinecap="round"
        />
        {/* Summit Stairs */}
        <path d="M 545 44 L 564 14" stroke="#CBB088" strokeWidth="8" strokeDasharray="3 3" />

        {/* Railroad Tunnel & Tracks */}
        <rect x="364" y="54" width="310" height="8" fill="#5A4535" />
        <path d="M 366 58 L 674 58" stroke="#A8A19B" strokeWidth="4" strokeDasharray="8 6" />
        <path d="M 358 42 Q 371 28 384 42 L 384 64 L 358 64 Z" fill="#231914" />
        {/* Bathhouse / Spa */}
        <ValleyBuilding x={546} y={76} w={46} h={28} roof="#4A7E9D" wall="#DEC8B4" chimney />
        <ellipse cx="504" cy="86" rx="13" ry="7" fill="#52B0C9" stroke="#857463" strokeWidth="2" />

        {/* Witch's Swamp */}
        <path
          d="M 652 16 Q 714 8 756 36 Q 760 80 704 80 Q 644 76 652 16 Z"
          fill="#4A3C5D"
          stroke="#2E233C"
          strokeWidth="3"
        />
        <ellipse cx="696" cy="58" rx="20" ry="11" fill="#3C6B67" opacity="0.85" />
        <ValleyBuilding x={696} y={40} w={25} h={21} roof="#351F42" wall="#5C4D69" tower />

        {/* The Mines + Ore Cart & Adventurer's Guild */}
        <g transform="translate(804, 87)">
          <path d="M -22 12 L -22 -8 Q 0 -24 22 -8 L 22 12 Z" fill="#635850" stroke="#362C25" strokeWidth="2.5" />
          <path d="M -12 12 L -12 -3 Q 0 -14 12 -3 L 12 12 Z" fill="#1F1814" />
          <path d="M -4 8 L -4 19 M 4 8 L 4 19" stroke="#7A5A3E" strokeWidth="2" />
          {/* Ore Cart */}
          <rect x="20" y="4" width="12" height="8" rx="1.5" fill="#7D5C43" stroke="#3D2B1D" strokeWidth="1.2" />
          <circle cx="26" cy="3" r="3" fill="#F2B830" />
        </g>
        <ValleyBuilding x={930} y={87} w={38} h={26} roof="#4E6844" wall="#C9AF88" chimney />

        {/* Mountain Lake (twin forested islands + sunken log) */}
        <path
          d="M 762 118 C 815 104, 938 106, 956 154 C 970 194, 916 218, 845 216 C 780 214, 738 170, 762 118 Z"
          fill="url(#valley-water)"
          stroke="#265469"
          strokeWidth="3.2"
        />
        <ellipse cx="860" cy="164" rx="32" ry="18" fill="#70A049" stroke="#366235" strokeWidth="2" />
        <ellipse cx="922" cy="182" rx="16" ry="10" fill="#70A049" stroke="#366235" strokeWidth="2" />
        <rect x="812" y="160" width="22" height="8" fill="#9A6633" stroke="#593818" strokeWidth="1.2" />
        <rect x="888" y="170" width="22" height="8" fill="#9A6633" stroke="#593818" strokeWidth="1.2" />
        {/* Sunken Legend Log + Lake Pine */}
        <rect x="782" y="172" width="16" height="5" rx="2" fill="#784E28" />
        <PineTree x={858} y={156} scale={0.75} />

        {/* The Quarry & Bridge */}
        <path
          d="M 1012 78 L 1168 78 L 1178 166 L 1018 170 Z"
          fill="#9E9487"
          stroke="#5C5248"
          strokeWidth="3"
        />
        <rect x="962" y="138" width="56" height="10" fill="#8C592C" stroke="#523214" strokeWidth="1.5" />
        <circle cx="1056" cy="118" r="7" fill="#7C7062" />
        <circle cx="1090" cy="142" r="8" fill="#6F5947" />
        <circle cx="1126" cy="116" r="7" fill="#5D6478" />
        <circle cx="1108" cy="130" r="4.5" fill="#9B75E8" />
        <path d="M 1030 108 L 1030 96 Q 1040 88 1050 96 L 1050 108 Z" fill="#2A211C" />

        {/* Bookseller Plateau & Cliff Stairs */}
        <path d="M 1068 205 L 1178 205 L 1172 252 L 1062 250 Z" fill="#6B9847" stroke="#4D6E33" strokeWidth="2" />
        <path d="M 1084 250 L 1084 268" stroke="#CBB088" strokeWidth="8" strokeDasharray="3 3" />
        <g transform="translate(1122, 198)">
          <circle cx="0" cy="-12" r="14" fill="#C9453B" stroke="#6B221D" strokeWidth="1.5" />
          <path d="M -5 -24 Q 0 -12 -5 0 M 5 -24 Q 0 -12 5 0" stroke="#F4D36A" strokeWidth="2.5" fill="none" />
          <rect x="-5" y="6" width="10" height="7" rx="1" fill="#8D5A2D" />
        </g>

        {/* Carpenter's Shop (with Demetrius Wing) & Linus's Tent */}
        <ValleyBuilding x={570} y={171} w={42} h={28} roof="#9D5A36" wall="#DFBE8E" chimney />
        <g transform="translate(672, 133)">
          <polygon points="0,-13 13,6 -13,6" fill="#E6B23A" stroke="#7A5612" strokeWidth="1.8" />
          <polygon points="0,-4 4,6 -4,6" fill="#4A3216" />
          <circle cx="17" cy="5" r="4" fill="#F06824" />
        </g>

        <text
          x="946"
          y="28"
          textAnchor="middle"
          fill="#FFFDF6"
          stroke="#403730"
          strokeWidth="3.2"
          paintOrder="stroke"
          fontSize="12.5"
          fontWeight="800"
          fontFamily="serif"
          letterSpacing="1.6"
        >
          THE MOUNTAINS
        </text>

        {/* ====================================================== */}
        {/* 3. EAST TOWN RIVER (Mountain Lake -> Ocean Estuary) */}
        {/* ====================================================== */}
        <path
          d="M 885 212 C 925 275, 972 325, 972 415 C 972 515, 984 565, 995 620"
          fill="none"
          stroke="url(#valley-water)"
          strokeWidth="30"
          strokeLinecap="round"
        />
        <path
          d="M 898 232 Q 912 246 920 264 M 968 380 V 402 M 976 476 V 498"
          stroke="#BCEBF7"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
          opacity="0.58"
        />

        {/* ====================================================== */}
        {/* 4. THE FARMSTEAD & BACKWOODS */}
        {/* ====================================================== */}
        <path
          d="M 320 250 Q 380 198 475 176 L 760 176"
          fill="none"
          stroke="#C2A374"
          strokeWidth="15"
          strokeLinecap="round"
        />
        <rect x="195" y="232" width="218" height="148" rx="18" fill="#B8955A" stroke="#7B562B" strokeWidth="3" />
        {/* Tilled Crop Plots & Meadow Pasture */}
        <rect x="215" y="296" width="84" height="44" rx="4" fill="#8C6036" opacity="0.82" />
        <path d="M 222 307 L 292 307 M 222 319 L 292 319 M 222 331 L 292 331" stroke="#5EA043" strokeWidth="4" strokeDasharray="6 4" />
        {/* Tiny Scarecrow */}
        <path d="M 294 318 V 332 M 289 323 H 299" stroke="#F4D36A" strokeWidth="2.2" />
        <rect x="315" y="300" width="76" height="40" rx="4" fill="#8C6036" opacity="0.65" />
        <ellipse cx="352" cy="356" rx="22" ry="11" fill="#3B93B2" stroke="#6E4E28" strokeWidth="2" />
        {/* Shipping Bin */}
        <rect x="382" y="266" width="14" height="10" rx="1.5" fill="#9E622B" stroke="#543314" strokeWidth="1.2" />
        <ValleyBuilding x={242} y={258} w={34} h={22} roof="#55A9BE" wall="#D9EFEA" />
        <ValleyBuilding x={318} y={266} w={42} h={28} roof="#B94836" wall="#EFE0C6" chimney />
        <ValleyBuilding x={220} y={356} w={28} h={22} roof="#A33329" wall="#C94A3D" />

        {/* Farm East Highway -> Tunnel -> Bus Stop -> Pelican Town */}
        <path d="M 110 274 L 645 274" stroke="#C5A676" strokeWidth="18" strokeLinecap="round" />
        <path d="M 162 258 Q 174 246 186 258 L 186 282 L 162 282 Z" fill="#2A2018" />
        <g transform="translate(486, 270)">
          <rect x="-18" y="-9" width="36" height="16" rx="3" fill="#E3AE36" stroke="#7A5414" strokeWidth="1.8" />
          <rect x="-13" y="-6" width="8" height="5" fill="#9ED7EA" />
          <rect x="-2" y="-6" width="8" height="5" fill="#9ED7EA" />
          <rect x="9" y="-6" width="6" height="5" fill="#9ED7EA" />
          <circle cx="-10" cy="8" r="3" fill="#2A231D" />
          <circle cx="10" cy="8" r="3" fill="#2A231D" />
        </g>
        <text
          x="362"
          y="398"
          textAnchor="middle"
          fill="#FFF8EA"
          stroke="#5A3A1B"
          strokeWidth="3.2"
          paintOrder="stroke"
          fontSize="12.5"
          fontWeight="800"
          fontFamily="serif"
          letterSpacing="1.3"
        >
          THE FARMSTEAD
        </text>

        {/* ====================================================== */}
        {/* 5. SECRET WOODS & CINDERSAP FOREST */}
        {/* ====================================================== */}
        <rect x="22" y="305" width="166" height="140" rx="34" fill="#325E2D" stroke="#244620" strokeWidth="3" />
        <ellipse cx="96" cy="382" rx="28" ry="15" fill="#3585A1" stroke="#234821" strokeWidth="2" />
        <rect x="172" y="390" width="22" height="11" rx="3" fill="#6F4726" stroke="#3D2411" strokeWidth="1.5" />
        {/* Old Master Cannoli */}
        <rect x="90" y="346" width="12" height="15" rx="2" fill="#918A7D" stroke="#4D4840" strokeWidth="1.5" />

        {/* Cindersap Lake + Arrowhead Island */}
        <path
          d="M 278 424 C 318 404, 400 412, 414 454 C 428 498, 386 534, 332 526 C 282 522, 248 468, 278 424 Z"
          fill="url(#valley-water)"
          stroke="#27556A"
          strokeWidth="3"
        />
        <polygon points="348,444 374,470 348,508 320,470" fill="#70A049" stroke="#3B622E" strokeWidth="2" />
        {/* Forest River flowing south past Leah's & Waterfalls */}
        <path
          d="M 382 508 C 414 542, 405 588, 396 645 C 392 695, 430 726, 498 742"
          fill="none"
          stroke="url(#valley-water)"
          strokeWidth="22"
          strokeLinecap="round"
        />
        <path d="M 386 626 L 408 626 M 384 632 L 408 632" stroke="#D9F6FF" strokeWidth="3.5" strokeLinecap="round" />
        <rect x="383" y="544" width="28" height="10" fill="#9A6633" stroke="#573618" strokeWidth="1.2" />
        <ellipse cx="385" cy="680" rx="22" ry="11" fill="#76A44E" stroke="#476D2E" strokeWidth="1.8" />
        <rect x="372" y="662" width="18" height="8" fill="#9A6633" />

        {/* Traveling Cart Wagon */}
        <g transform="translate(258, 388)">
          <rect x="-15" y="-10" width="30" height="16" rx="5" fill="#9B3930" stroke="#4F2417" strokeWidth="1.5" />
          <path d="M -13 -10 Q 0 -22 13 -10 Z" fill="#F0DFB8" stroke="#6E4E2E" strokeWidth="1.5" />
          <circle cx="-8" cy="7" r="3.5" fill="#5A391E" />
          <circle cx="8" cy="7" r="3.5" fill="#5A391E" />
        </g>
        {/* Giant Stump Hollow */}
        <g transform="translate(240, 509)">
          <ellipse cx="0" cy="4" rx="19" ry="12" fill="#6F4A2B" stroke="#3F2714" strokeWidth="2" />
          <ellipse cx="0" cy="0" rx="14" ry="8" fill="#9A6E44" />
          <ellipse cx="0" cy="1" rx="7" ry="4" fill="#3B2415" />
        </g>
        {/* Wizard's Tower + Flower Dance Bridge */}
        <path d="M 55 568 L 114 544" stroke="#9E6A36" strokeWidth="10" strokeLinecap="round" />
        <circle cx="46" cy="576" r="4" fill="#F7E479" />
        <circle cx="38" cy="564" r="3.5" fill="#EA8FA8" />
        <ValleyBuilding x={132} y={528} w={30} h={40} roof="#6A3A8E" wall="#8D888E" tower />

        {/* Marnie's Ranch (+ paddock sheep) & Leah's Cottage */}
        <ValleyBuilding x={498} y={388} w={44} h={30} roof="#A6352C" wall="#E8D2AA" chimney />
        <rect x="446" y="394" width="26" height="18" fill="none" stroke="#EFE2C4" strokeWidth="2" />
        <circle cx="458" cy="403" r="3.5" fill="#FFFDF7" />
        <ValleyBuilding x={498} y={464} w={30} h={24} roof="#78502C" wall="#B58958" chimney />

        {/* Hat Mouse Cabin */}
        <ValleyBuilding x={396} y={604} w={28} h={22} roof="#5D646E" wall="#8A7665" />

        {/* Pine & Oak Woodlands */}
        <PineTree x={58} y={336} scale={1.15} />
        <PineTree x={134} y={346} scale={1.1} />
        <PineTree x={68} y={416} scale={1.05} />
        <PineTree x={156} y={428} scale={1} />
        <PineTree x={92} y={495} scale={1.1} />
        <PineTree x={198} y={435} scale={0.95} />
        <OakTree x={195} y={548} scale={1.05} />
        <PineTree x={282} y={584} scale={1.1} />
        <PineTree x={195} y={615} scale={1.15} />
        <OakTree x={135} y={615} scale={1} />
        <PineTree x={312} y={642} scale={1} />
        <PineTree x={432} y={665} scale={1.05} />

        <text
          x="98"
          y="432"
          textAnchor="middle"
          fill="#DFECD0"
          stroke="#203C1C"
          strokeWidth="2.8"
          paintOrder="stroke"
          fontSize="11.5"
          fontWeight="800"
          fontFamily="serif"
          letterSpacing="1"
        >
          SECRET WOODS
        </text>
        <text
          x="268"
          y="712"
          textAnchor="middle"
          fill="#EAF5DC"
          stroke="#23421D"
          strokeWidth="3.2"
          paintOrder="stroke"
          fontSize="13.5"
          fontWeight="800"
          fontFamily="serif"
          letterSpacing="1.4"
        >
          CINDERSAP FOREST
        </text>

        {/* ====================================================== */}
        {/* 6. PELICAN TOWN (Streets, Plazas, River Bridges, Houses) */}
        {/* ====================================================== */}
        <rect x="598" y="255" width="268" height="232" rx="18" fill="url(#valley-cobble)" stroke="#9B7D54" strokeWidth="2" />
        {/* Town Cobblestone Roads & East River Extensions */}
        <path
          d="M 540 274 L 756 274 L 756 232 M 602 344 L 965 344 M 985 344 L 1075 344 M 595 426 L 965 426 M 985 426 L 1110 426 M 748 344 L 748 522"
          fill="none"
          stroke="#CFB386"
          strokeWidth="16"
          strokeLinecap="round"
        />
        {/* Wooden Bridges Centered Over East River (`x ~ 972`) */}
        <rect x="948" y="334" width="48" height="18" rx="2" fill="#9A6633" stroke="#523216" strokeWidth="1.5" />
        <rect x="950" y="417" width="48" height="18" rx="2" fill="#9A6633" stroke="#523216" strokeWidth="1.5" />

        {/* Central Plaza Courtyard, Flowerbeds & Fountain */}
        <rect x="664" y="352" width="84" height="38" rx="6" fill="#E3CEAA" stroke="#8C6F47" strokeWidth="2" />
        <circle cx="702" cy="370" r="8.5" fill="#5CB4CE" stroke="#8A745A" strokeWidth="2" />
        <circle cx="676" cy="364" r="3" fill="#E6697B" />
        <circle cx="728" cy="364" r="3" fill="#F2BE46" />
        <circle cx="676" cy="378" r="3" fill="#F2BE46" />

        {/* Playground Slide + Swings */}
        <path d="M 678 242 H 700 M 684 242 V 252 M 694 242 V 252" stroke="#7A5633" strokeWidth="2" />

        {/* Community Center */}
        <ValleyBuilding x={756} y={232} w={54} h={34} roof="#6A744B" wall="#E8DCC3" />
        {/* Harvey's Clinic & Pierre's General Store (cleanly staggered) */}
        <ValleyBuilding x={624} y={312} w={36} h={28} roof="#8D4B43" wall="#DFCEB4" crossSign />
        <ValleyBuilding x={738} y={312} w={50} h={30} roof="#9C4D3B" wall="#EFE0C6" awning="#2C788C" />
        {/* JojaMart / Movie Theater */}
        <ValleyBuilding x={1062} y={300} w={62} h={34} roof="#2E5F8A" wall="#D8DEE6" awning="#1F4162" />
        {/* Stardrop Saloon (shifted east of Fountain for spacious pin room) */}
        <ValleyBuilding x={810} y={412} w={44} h={28} roof="#78323B" wall="#D8A76E" chimney />
        {/* Riverfront Trailer / Pam's House */}
        <ValleyBuilding x={900} y={361} w={36} h={20} roof="#9CA8AF" wall="#EFE9DA" />
        {/* Willow Lane Houses */}
        <ValleyBuilding x={606} y={422} w={36} h={26} roof="#6E8254" wall="#EFE1C6" />
        <ValleyBuilding x={696} y={422} w={36} h={26} roof="#4A7A8C" wall="#EFE1C6" />
        {/* Mayor's Manor & 1 River Road */}
        <ValleyBuilding x={864} y={441} w={48} h={30} roof="#557147" wall="#F5EFE2" chimney />
        {/* Clint's Blacksmith */}
        <ValleyBuilding x={1062} y={384} w={42} h={28} roof="#5A524D" wall="#B89872" chimney />
        {/* Archaeology Museum */}
        <ValleyBuilding x={1098} y={452} w={48} h={28} roof="#B4854E" wall="#EEDDC0" dome />
        {/* Sewers Iron Grate */}
        <g transform="translate(672, 480)">
          <circle cx="0" cy="0" r="10" fill="#2D362D" stroke="#6B736B" strokeWidth="2.5" />
          <path d="M -5 -4 L -5 4 M 0 -5 L 0 5 M 5 -4 L 5 4" stroke="#8D9E8B" strokeWidth="2" />
        </g>

        <OakTree x={582} y={295} scale={0.95} />
        <OakTree x={820} y={295} scale={0.95} />
        <OakTree x={910} y={290} scale={0.9} />
        <OakTree x={785} y={468} scale={0.9} />

        <text
          x="868"
          y="272"
          textAnchor="middle"
          fill="#FFFDF6"
          stroke="#4D3721"
          strokeWidth="3.2"
          paintOrder="stroke"
          fontSize="12.5"
          fontWeight="800"
          fontFamily="serif"
          letterSpacing="1.6"
        >
          PELICAN TOWN
        </text>

        {/* ====================================================== */}
        {/* 7. SOUTHERN BEACH, ATTACHED TIDE POOLS & STARDEW OCEAN */}
        {/* ====================================================== */}
        <path
          d="M 520 518 L 1200 500 L 1200 760 L 495 760 Z"
          fill="url(#valley-beach)"
        />
        {/* Coastal Cliff Bluff Wall & Town Steps */}
        <path d="M 520 518 L 1200 500" stroke="#9B7542" strokeWidth="7" />
        <rect x="736" y="502" width="24" height="24" fill="#9A6633" stroke="#543316" strokeWidth="1.5" />

        {/* Stardew Ocean Wave Line (leaving attached sandy East Tide Pools headland!) */}
        <path
          d="M 498 595 C 655 588, 825 574, 968 584 C 986 586, 1004 548, 1025 546 C 1020 578, 1036 608, 1085 612 C 1132 616, 1175 595, 1200 584 L 1200 760 L 490 760 Z"
          fill="url(#valley-water)"
        />
        <path
          d="M 510 602 Q 705 592 945 586"
          fill="none"
          stroke="#C2EDF7"
          strokeWidth="3.5"
          opacity="0.72"
        />
        <path
          d="M 565 654 Q 605 648 640 655 M 880 682 Q 925 676 968 683 M 1042 664 Q 1086 658 1120 665"
          fill="none"
          stroke="#A8E4F2"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.52"
        />

        {/* Wooden West T-Dock & Willy's Pier (widely spaced!) */}
        <rect x="697" y="555" width="22" height="100" fill="#8C592C" stroke="#523216" strokeWidth="1.5" />
        <rect x="681" y="646" width="54" height="14" rx="2" fill="#8C592C" stroke="#523216" strokeWidth="1.5" />
        {/* Main Willy's Boathouse Pier & Sailboat */}
        <rect x="814" y="546" width="22" height="108" fill="#8C592C" stroke="#523216" strokeWidth="1.5" />
        <ValleyBuilding x={825} y={646} w={36} h={26} roof="#2E6F9E" wall="#D9BF96" />
        <g transform="translate(870, 650)">
          <path d="M -14 4 Q 0 12 14 4 L 10 -2 L -10 -2 Z" fill="#9A6232" stroke="#4D2F14" strokeWidth="1.2" />
          <polygon points="0,-16 10,-3 0,-3" fill="#FFFDF7" stroke="#6E4E2E" strokeWidth="1" />
        </g>

        {/* Elliott's Cabin */}
        <ValleyBuilding x={894} y={536} w={32} h={24} roof="#6A7B56" wall="#A87A4E" />

        {/* East Tide Pools Footbridge -> Attached Sandy Headland Cove */}
        <rect x="976" y="550" width="52" height="13" rx="2" fill="#8C592C" stroke="#523216" strokeWidth="1.5" />
        <circle cx="1064" cy="574" r="7" fill="#B69F7D" />
        <circle cx="1142" cy="566" r="6" fill="#9F8B6D" />
        <circle cx="1085" cy="586" r="5" fill="#E6697B" />
        <circle cx="1116" cy="574" r="4" fill="#8F55B0" />
        <circle cx="1136" cy="590" r="5" fill="#E6697B" />
        <ellipse cx="1102" cy="592" rx="16" ry="7" fill="#3D9BB8" opacity="0.72" />

        <text x="860" y="726" textAnchor="middle" fill="#E3F7FD" fontSize="15" fontWeight="800" fontFamily="serif" letterSpacing="2">
          STARDEW OCEAN
        </text>

        {/* Compass Rose */}
        <g transform="translate(1148, 50)">
          <circle cx="0" cy="0" r="24" fill="#FFFDF7" fillOpacity="0.86" stroke="#5C3A21" strokeWidth="2" />
          <polygon points="0,-19 5,0 -5,0" fill="#B5372D" />
          <polygon points="0,19 5,0 -5,0" fill="#5C3A21" />
          <text x="0" y="-20" textAnchor="middle" fontSize="9" fontWeight="800" fill="#2B1E13">N</text>
        </g>

        <CartographicFrame />
      </svg>
    );
  }

  /* ============================================================== */
  /* GINGER ISLAND SCULPTED ARCHIPELAGO ARTWORK (1200 x 760) */
  /* ============================================================== */
  return (
    <svg
      viewBox="0 0 1200 760"
      width="1200"
      height="760"
      style={{ display: 'block', userSelect: 'none' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="island-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1B6482" />
          <stop offset="100%" stopColor="#13465E" />
        </linearGradient>
        <linearGradient id="island-sand" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F2DC9F" />
          <stop offset="100%" stopColor="#DABC72" />
        </linearGradient>
        <linearGradient id="island-jungle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5D9C44" />
          <stop offset="100%" stopColor="#3B7232" />
        </linearGradient>
      </defs>

      <rect width="1200" height="760" fill="url(#island-sea)" />

      {/* Subtle Nautical Map Latitude/Longitude Grid */}
      <g stroke="#8DD8ED" strokeOpacity="0.14" strokeWidth="1">
        <line x1="0" y1="190" x2="1200" y2="190" />
        <line x1="0" y1="380" x2="1200" y2="380" />
        <line x1="0" y1="570" x2="1200" y2="570" />
        <line x1="300" y1="0" x2="300" y2="760" />
        <line x1="600" y1="0" x2="600" y2="760" />
        <line x1="900" y1="0" x2="900" y2="760" />
      </g>

      {/* Ocean Ripples & Ferry Approach Trail */}
      <path
        d="M 85 170 Q 125 162 162 172 M 1015 190 Q 1055 182 1095 191 M 190 670 Q 245 660 295 670 M 955 685 Q 1005 676 1055 686"
        fill="none"
        stroke="#92E0F2"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.34"
      />
      <path d="M 642 674 L 642 752" stroke="#D9F6FF" strokeWidth="2.5" strokeDasharray="6 6" opacity="0.52" />

      {/* Coral Reef Turquoise Shoals */}
      <path
        d="M 105 405 C 95 280, 210 215, 365 215 C 445 215, 480 125, 625 90 C 765 95, 815 215, 925 250 C 1075 290, 1145 450, 1105 585 C 1065 660, 880 655, 765 630 C 660 665, 535 665, 455 620 C 315 675, 130 625, 105 405 Z"
        fill="#44B2C5"
        opacity="0.46"
      />

      {/* White Breaking Surf Halo */}
      <path
        d="M 134 410 C 126 296, 230 238, 388 244 C 458 244, 496 128, 635 114 C 770 120, 804 238, 910 270 C 1052 306, 1112 446, 1081 564 C 1044 630, 885 626, 775 596 C 685 638, 575 638, 495 591 C 342 650, 156 600, 134 410 Z"
        fill="none"
        stroke="#C5F2FA"
        strokeWidth="5"
        opacity="0.58"
      />

      {/* Sculpted Ginger Island Shoreline (West Peninsula, South Bay, East Jungle Cape) */}
      <path
        d="M 140 410 C 132 300, 235 245, 390 250 C 460 250, 500 135, 635 120 C 765 125, 800 245, 905 275 C 1045 310, 1105 445, 1075 560 C 1040 625, 885 620, 775 590 C 685 632, 575 632, 495 585 C 345 645, 162 595, 140 410 Z"
        fill="url(#island-sand)"
        stroke="#B08A48"
        strokeWidth="4.5"
      />

      {/* Emerald Jungle Highlands */}
      <path
        d="M 190 390 C 185 310, 275 275, 405 278 C 480 278, 515 170, 635 162 C 745 168, 785 272, 875 295 C 990 328, 1030 430, 1005 520 C 965 568, 845 555, 760 535 C 675 568, 580 568, 505 530 C 365 572, 208 532, 190 390 Z"
        fill="url(#island-jungle)"
        stroke="#36622C"
        strokeWidth="3"
      />

      {/* Winding Sandy Island Trails */}
      <path
        d="M 642 548 L 642 465 Q 640 375 635 290 M 642 470 Q 490 480 345 430 M 642 475 Q 785 460 915 415 L 985 475 L 1035 535 M 642 556 Q 410 612 248 565"
        fill="none"
        stroke="#DEC383"
        strokeWidth="13"
        strokeLinecap="round"
        opacity="0.82"
      />

      {/* Volcano Peak (Tiered Basalt Cliffs & Glowing Lava Streams) */}
      <g transform="translate(636, 115)">
        <polygon points="-136,100 -52,-54 52,-54 136,100" fill="#5D4D4F" stroke="#362A2D" strokeWidth="3.5" />
        <polygon points="-92,100 -36,-38 36,-38 92,100" fill="#746164" opacity="0.58" />
        {/* Magma Fissure Glow */}
        <path d="M -22 -42 Q -38 0 -30 35 M 24 -42 Q 42 5 35 45" stroke="#EA6B2E" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7" />
        <ellipse cx="0" cy="-54" rx="46" ry="15" fill="#E65824" stroke="#FFC43A" strokeWidth="3" />
        <ellipse cx="0" cy="-56" rx="22" ry="6" fill="#FFE066" opacity="0.75" />
        {/* Steaming Crater Smoke */}
        <path d="M -18 -70 Q -5 -86 12 -74 M 14 -68 Q 26 -82 36 -70" stroke="#D1C7C7" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.68" />
        {/* Volcano Entrance Cave */}
        <path d="M -16 98 L -16 74 Q 0 58 16 74 L 16 98 Z" fill="#2A1E1C" stroke="#E0622D" strokeWidth="2" />
      </g>
      <text
        x="636"
        y="186"
        textAnchor="middle"
        fill="#FFF3DC"
        stroke="#3D2C2B"
        strokeWidth="3"
        paintOrder="stroke"
        fontSize="12.5"
        fontWeight="800"
        fontFamily="serif"
        letterSpacing="1"
      >
        VOLCANO CALDERA
      </text>

      {/* Island North Canyon River & Dig Site */}
      <path
        d="M 565 215 C 555 275, 485 315, 370 355 C 315 375, 305 460, 330 565"
        fill="none"
        stroke="#3697B8"
        strokeWidth="22"
        strokeLinecap="round"
      />
      <rect x="495" y="275" width="44" height="12" rx="2" fill="#8C592C" stroke="#523216" strokeWidth="1.5" />
      <rect x="475" y="242" width="112" height="58" rx="14" fill="#B59B69" stroke="#7A6542" strokeWidth="2" />
      <path d="M 522 260 L 545 260 M 527 254 L 529 266 M 537 254 L 539 266" stroke="#F4EAD2" strokeWidth="2.5" />
      <circle cx="494" cy="264" r="5" fill="#D4C29E" />
      <ValleyBuilding x={558} y={274} w={28} h={20} roof="#2E7F8F" wall="#E8D2A4" />
      {/* Prof. Snail Field Office Tent */}
      <ValleyBuilding x={750} y={255} w={36} h={24} roof="#E5D7BA" wall="#C9B28B" awning="#9E483C" />

      {/* Island West Farm, Warp Obelisk, Gourmand Cave, Qi Door & Birdie */}
      <rect x="218" y="388" width="128" height="86" rx="12" fill="#A67C46" stroke="#6E4E25" strokeWidth="2.5" />
      <path d="M 232 406 L 304 406 M 232 422 L 304 422 M 232 438 L 304 438" stroke="#63AA42" strokeWidth="4.5" strokeDasharray="7 5" />
      {/* Gourmand Frog Cave */}
      <path d="M 206 318 Q 218 302 230 318 Z" fill="#292420" />
      {/* Island Farm House + Island Obelisk Pillar */}
      <ValleyBuilding x={300} y={380} w={34} h={24} roof="#B86B34" wall="#DFBE8E" />
      <rect x="340" y="354" width="9" height="24" rx="2" fill="#328BA6" stroke="#1E4E5E" strokeWidth="1.5" />
      <circle cx="344.5" cy="362" r="3" fill="#F2B830" />
      {/* Mr. Qi's Walnut Door */}
      <g transform="translate(174, 323)">
        <path d="M -16 14 L -16 -6 Q 0 -22 16 -6 L 16 14 Z" fill="#5A2A82" stroke="#D9A83B" strokeWidth="2.5" />
        <circle cx="0" cy="-2" r="5" fill="#8EF0FF" />
      </g>
      {/* Birdie's Driftwood Hut & Campfire */}
      <ValleyBuilding x={222} y={555} w={28} h={22} roof="#7C5633" wall="#A8825B" />
      <circle cx="248" cy="566" r="4" fill="#F27228" />

      {/* South Resort Beach Umbrellas & Ferry Pier */}
      <ValleyBuilding x={642} y={536} w={46} h={28} roof="#B56E38" wall="#EAD4A6" awning="#2E8C7A" />
      <circle cx="595" cy="560" r="9" fill="#E35648" stroke="#FFF8EA" strokeWidth="1.5" />
      <circle cx="692" cy="560" r="9" fill="#3B93B2" stroke="#FFF8EA" strokeWidth="1.5" />
      <rect x="628" y="592" width="28" height="80" rx="3" fill="#8C592C" stroke="#543316" strokeWidth="2" />
      <rect x="614" y="658" width="56" height="16" rx="2" fill="#8C592C" stroke="#543316" strokeWidth="2" />

      {/* East Jungle Canopy, Gem Bird Sanctuary Plaza & Leo's Hut */}
      <OakTree x={845} y={325} scale={1.1} leaf="#2D5E26" />
      <OakTree x={895} y={352} scale={1.15} leaf="#376F2F" />
      <OakTree x={975} y={382} scale={1.2} leaf="#2D5E26" />
      <OakTree x={925} y={432} scale={1.1} leaf="#3D7834" />
      <OakTree x={858} y={482} scale={1} leaf="#356C2D" />
      <OakTree x={755} y={395} scale={1.05} leaf="#3A7431" />
      <ValleyBuilding x={960} y={384} w={30} h={24} roof="#6A9B3B" wall="#8D6136" />
      {/* Gem Bird Shrine Plaza (4 colored pedestals) */}
      <g transform="translate(884, 466)">
        <rect x="-18" y="-14" width="36" height="28" rx="6" fill="#A99E8B" stroke="#5E5445" strokeWidth="1.8" />
        <circle cx="-10" cy="-6" r="3" fill="#D94545" />
        <circle cx="10" cy="-6" r="3" fill="#46B86D" />
        <circle cx="-10" cy="6" r="3" fill="#9E5AE0" />
        <circle cx="10" cy="6" r="3" fill="#F2B830" />
      </g>

      {/* Pirate Cove Grotto & Skull Cavern Entrance */}
      <ellipse cx="1055" cy="560" rx="48" ry="34" fill="#1E6280" stroke="#7A6542" strokeWidth="3.5" />
      <g transform="translate(1062, 536)">
        <path d="M -20 12 L -20 -6 Q 0 -24 20 -6 L 20 12 Z" fill="#4E4744" stroke="#292422" strokeWidth="2" />
        <path d="M -11 12 L -11 -2 Q 0 -12 11 -2 L 11 12 Z" fill="#171413" />
      </g>

      {/* Scattered Coconut Palms & Center Jungle Trees */}
      <PalmTree x={420} y={535} scale={1} />
      <PalmTree x={555} y={548} scale={0.95} />
      <PalmTree x={720} y={540} scale={1} />
      <PalmTree x={830} y={505} scale={1} />
      <PalmTree x={350} y={535} scale={0.95} />
      <PalmTree x={485} y={405} scale={0.92} />
      <OakTree x={485} y={495} scale={1} leaf="#427F38" />
      <OakTree x={600} y={375} scale={0.95} leaf="#376F2F" />

      <text x="600" y="724" textAnchor="middle" fill="#E3F6FB" fontSize="15" fontWeight="800" fontFamily="serif" letterSpacing="2">
        GINGER ISLAND — FERN ARCHIPELAGO
      </text>

      <g transform="translate(1148, 50)">
        <circle cx="0" cy="0" r="24" fill="#FFFDF7" fillOpacity="0.86" stroke="#18475F" strokeWidth="2" />
        <polygon points="0,-19 5,0 -5,0" fill="#B5372D" />
        <polygon points="0,19 5,0 -5,0" fill="#18475F" />
        <text x="0" y="-20" textAnchor="middle" fontSize="9" fontWeight="800" fill="#18475F">N</text>
      </g>

      <CartographicFrame accent="#7ACFE0" inner="#113C50" />
    </svg>
  );
}
