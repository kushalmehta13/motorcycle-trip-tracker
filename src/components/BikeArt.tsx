import type { BikeType } from "@/db/schema";

function Wheel({
  cx,
  cy,
  accent,
  knobby = false,
}: {
  cx: number;
  cy: number;
  accent: string;
  knobby?: boolean;
}) {
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={knobby ? 36 : 34}
        fill="#fff"
        stroke="#161616"
        strokeWidth={9}
        strokeDasharray={knobby ? "9 7" : undefined}
      />
      <circle cx={cx} cy={cy} r={14} fill="none" stroke="#161616" strokeWidth={5} />
      <circle cx={cx} cy={cy} r={4.5} fill={accent} />
    </g>
  );
}

export default function BikeArt({
  type,
  accent,
  seed,
}: {
  type: BikeType;
  accent: string;
  seed?: number | string;
}) {
  const patternId = `stripes-${seed ?? type}`;
  const shape = {
    fill: accent,
    stroke: "#161616",
    strokeWidth: 6,
    strokeLinejoin: "round" as const,
  };
  const line = {
    stroke: "#161616",
    strokeWidth: 11,
    strokeLinecap: "round" as const,
  };

  return (
    <svg
      viewBox="0 0 400 260"
      className="h-full w-full"
      role="img"
      aria-label={`${type} motorcycle illustration`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <pattern
          id={patternId}
          width={26}
          height={26}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width={12} height={26} fill={accent} opacity={0.13} />
        </pattern>
      </defs>

      <rect width={400} height={260} fill="#F6F1E7" />
      <rect width={400} height={260} fill={`url(#${patternId})`} />

      {type === "standard" && (
        <g>
          <line x1={98} y1={182} x2={196} y2={160} {...line} />
          <line x1={236} y1={140} x2={300} y2={174} {...line} />
          <line x1={302} y1={182} x2={276} y2={110} {...line} />
          <line x1={268} y1={106} x2={288} y2={98} {...line} />
          <rect x={176} y={112} width={72} height={38} rx={17} {...shape} />
          <rect x={116} y={114} width={60} height={14} rx={7} fill="#161616" />
          <Wheel cx={96} cy={182} accent={accent} />
          <Wheel cx={300} cy={182} accent={accent} />
        </g>
      )}

      {type === "sport" && (
        <g>
          <line x1={98} y1={180} x2={196} y2={160} {...line} />
          <line x1={196} y1={160} x2={240} y2={124} {...line} />
          <line x1={302} y1={182} x2={272} y2={114} {...line} />
          <line x1={264} y1={108} x2={282} y2={99} {...line} />
          <polygon points="136,146 208,124 222,144 156,162" {...shape} />
          <rect x={204} y={104} width={62} height={32} rx={13} {...shape} />
          <polygon points="264,106 308,128 296,152 256,138" {...shape} />
          <rect x={142} y={134} width={52} height={12} rx={6} fill="#161616" />
          <line x1={150} y1={200} x2={248} y2={192} stroke="#161616" strokeWidth={7} strokeLinecap="round" />
          <circle cx={254} cy={191} r={5} fill="#161616" />
          <Wheel cx={96} cy={180} accent={accent} />
          <Wheel cx={302} cy={182} accent={accent} />
        </g>
      )}

      {type === "cruiser" && (
        <g>
          <line x1={100} y1={182} x2={212} y2={150} {...line} />
          <line x1={212} y1={150} x2={252} y2={142} {...line} />
          <line x1={320} y1={184} x2={286} y2={108} {...line} />
          <path d="M286 108 Q268 90 250 100" fill="none" stroke="#161616" strokeWidth={9} strokeLinecap="round" />
          <path d="M196 118 C230 100 270 108 278 128 C258 142 216 140 196 132 Z" {...shape} />
          <rect x={128} y={130} width={64} height={12} rx={6} fill="#161616" />
          <path d="M288 148 A 46 46 0 0 1 356 166" fill="none" stroke={accent} strokeWidth={11} strokeLinecap="round" />
          <path d="M66 150 A 46 46 0 0 1 134 168" fill="none" stroke={accent} strokeWidth={11} strokeLinecap="round" />
          <line x1={234} y1={168} x2={254} y2={178} stroke="#161616" strokeWidth={8} strokeLinecap="round" />
          <line x1={150} y1={202} x2={284} y2={196} stroke="#161616" strokeWidth={6} strokeLinecap="round" />
          <Wheel cx={98} cy={182} accent={accent} />
          <Wheel cx={320} cy={184} accent={accent} />
        </g>
      )}

      {type === "touring" && (
        <g>
          <line x1={98} y1={182} x2={200} y2={158} {...line} />
          <line x1={200} y1={158} x2={244} y2={130} {...line} />
          <line x1={304} y1={182} x2={276} y2={106} {...line} />
          <rect x={252} y={72} width={42} height={24} rx={7} fill="#fff" stroke="#161616" strokeWidth={6} />
          <rect x={246} y={90} width={56} height={68} rx={14} {...shape} />
          <rect x={196} y={112} width={52} height={30} rx={12} {...shape} />
          <rect x={140} y={118} width={46} height={26} rx={7} fill="#161616" />
          <rect x={112} y={142} width={46} height={42} rx={9} fill="#161616" />
          <rect x={54} y={140} width={46} height={44} rx={9} fill="#161616" />
          <line x1={150} y1={202} x2={240} y2={195} stroke="#161616" strokeWidth={7} strokeLinecap="round" />
          <Wheel cx={96} cy={182} accent={accent} />
          <Wheel cx={304} cy={182} accent={accent} />
        </g>
      )}

      {type === "adventure" && (
        <g>
          <line x1={98} y1={182} x2={198} y2={158} {...line} />
          <line x1={198} y1={158} x2={240} y2={128} {...line} />
          <line x1={302} y1={182} x2={272} y2={102} {...line} />
          <line x1={252} y1={84} x2={288} y2={93} {...line} />
          <path d="M270 118 A 48 48 0 0 1 334 138" fill="none" stroke="#161616" strokeWidth={9} strokeLinecap="round" />
          <polygon points="270,102 320,116 306,134 266,120" {...shape} />
          <rect x={240} y={94} width={40} height={42} rx={11} {...shape} />
          <rect x={196} y={110} width={50} height={32} rx={13} {...shape} />
          <rect x={134} y={126} width={62} height={13} rx={6} fill="#161616" />
          <line x1={148} y1={198} x2={242} y2={190} stroke="#161616" strokeWidth={8} strokeLinecap="round" />
          <Wheel cx={96} cy={182} accent={accent} knobby />
          <Wheel cx={302} cy={182} accent={accent} knobby />
        </g>
      )}

      {type === "scooter" && (
        <g>
          <rect x={128} y={186} width={104} height={13} rx={6} fill="#161616" />
          <path d="M232 186 C240 146 248 124 272 112 L294 122 C284 140 276 154 274 186 Z" {...shape} />
          <line x1={278} y1={110} x2={262} y2={95} {...line} />
          <circle cx={258} cy={91} r={6} fill="#161616" />
          <rect x={140} y={148} width={78} height={20} rx={10} fill="#161616" />
          <rect x={152} y={166} width={82} height={22} rx={9} {...shape} />
          <line x1={308} y1={192} x2={286} y2={122} {...line} />
          <Wheel cx={310} cy={192} accent={accent} />
          <Wheel cx={112} cy={192} accent={accent} />
        </g>
      )}

      {type === "track" && (
        <g>
          <line x1={98} y1={180} x2={196} y2={160} {...line} />
          <line x1={196} y1={160} x2={240} y2={124} {...line} />
          <line x1={302} y1={182} x2={272} y2={114} {...line} />
          <line x1={264} y1={108} x2={282} y2={99} {...line} />
          <polygon points="136,146 208,124 222,144 156,162" {...shape} />
          <rect x={204} y={104} width={62} height={32} rx={13} {...shape} />
          <polygon points="264,106 308,128 296,152 256,138" {...shape} />
          <polygon points="150,166 262,166 250,198 160,198" fill="#fff" stroke="#161616" strokeWidth={6} strokeLinejoin="round" />
          <circle cx={206} cy={182} r={16} fill="#fff" stroke="#161616" strokeWidth={5} />
          <text x={206} y={189} textAnchor="middle" fontSize={19} fontWeight="bold" fill="#161616">
            7
          </text>
          <Wheel cx={96} cy={180} accent={accent} />
          <Wheel cx={302} cy={182} accent={accent} />
        </g>
      )}
    </svg>
  );
}
