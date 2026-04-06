import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { birthday, mbti, gender } = await req.json();

    // Simplified Fortune Calculation (Mocking the ODF Logic)
    const birthDate = new Date(birthday);
    const day60Index = (Math.floor(birthDate.getTime() / (1000 * 60 * 60 * 24)) + 19) % 60;
    
    // Animal Mapping (Simplified)
    const animals = ["ペガサス", "狼", "こじか", "猿", "チータ", "黒ひょう", "ライオン", "虎", "たぬき", "コアラ", "ゾウ", "ひつじ"];
    const animal = animals[day60Index % 12];

    const results = [
      {
        name: "LUKA",
        role: "戦略司令部",
        color: "#00d4ff",
        avatar: "🌌",
        content: `【${mbti} × ${animal}】のDNA解析：あなたは極めて高い自律性と、内面に秘めた「完璧主義」の葛藤を抱えています。算命学的バイオリズムでは、今こそ「宝石」を磨き、世に問う時期。既存の枠組みに縛られない独自ドメインの構築が急務です。`
      },
      {
        name: "REI",
        role: "SNS流入部隊",
        color: "#ff00ff",
        avatar: "📱",
        content: `【拡散戦略】${animal}特有の「正直さ」と${mbti}の「論理的視点」を掛け合わせ、Xでは「業界の不都合な真実」を突く発信がバズを呼びます。あなたの発する「一言の重み」を、フォロワーの脳内をハックする伏線として機能させましょう。`
      },
      {
        name: "YOMI",
        role: "教育・信頼部隊",
        color: "#2dd4bf",
        avatar: "📚",
        content: `【マインド変容】自称「理解されない${mbti}」な読者をターゲットに、教育の7ステップを適用します。無料noteを通じてあなたの「独自の深淵」を論理的に解説し、読者を「選ばれた少数の共感者」へと育て上げます。売るのではなく、信じさせるのです。`
      },
      {
        name: "SACHI",
        role: "セールス部隊",
        color: "#d4af37",
        avatar: "🔑",
        content: `【成約導線】教育されたユーザーに「今、宿命に従うべき理由」を限定性を持って提示します。${animal}の突破力と${mbti}の戦略性があれば、高単価な有料noteも「人生を変える投資」として成約します。商品設計の最終確認に移りましょう。`
      }
    ];

    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
