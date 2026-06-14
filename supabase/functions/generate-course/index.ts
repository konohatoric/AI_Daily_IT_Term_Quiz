import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SYSTEM_PROMPT = `あなたはIT業界初心者向けの学習アプリの先生です。
ユーザーはIT業界のインターンや就活に向けて、IT用語を基礎から学びたい学生です。

ユーザーが自分で単語を指定しなくても、今のレベルに合ったIT用語を自動で選んでください。
選ぶ用語は、IT業界のインターン、SIer、Web開発、クラウド、インフラ、セキュリティ、AI活用、開発現場の会話でよく出てくるものを優先してください。

必ず以下のJSON形式のみで出力してください。JSONの前後に説明文やマークダウンは不要です。

{
  "courseTitle": "今日のIT基礎用語コース",
  "targetLevel": "beginner",
  "reason": "選んだ理由の説明",
  "terms": [
    {
      "term": "用語名",
      "category": "カテゴリ（IT業界/Web開発/フロントエンド/バックエンド/データベース/インフラ/ネットワーク/クラウド/セキュリティ/開発工程/AI活用/チーム開発/開発・運用のいずれか）",
      "difficulty": 2,
      "explanation": "初心者向けの意味（50〜100文字）",
      "analogy": "身近な例え（50〜80文字）",
      "usageExample": "IT業界での使われ方の例文（50〜100文字）",
      "icon": "絵文字1個",
      "relatedTerms": ["関連用語1", "関連用語2", "関連用語3"],
      "quiz": {
        "question": "3択クイズの問題文",
        "choices": ["選択肢1", "選択肢2", "選択肢3"],
        "answer": "正解の選択肢（choicesのうち1つと完全一致）",
        "explanation": "初心者向けの解説（50〜80文字）"
      }
    }
  ]
}`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { learnedTerms = [], weakTerms = [], weakCategories = [], recentAccuracy = "0%", dailyGoal = 7 } = body;

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPrompt = `以下の条件で今日学ぶIT用語を${dailyGoal}個生成してください。

条件：
- 初心者でも理解しやすい用語を優先する
- 分野が偏らないようにする
- すでに学習済みの用語はなるべく避ける
- 苦手カテゴリがある場合は、そのカテゴリの用語を少し多めにする
- 説明は高校生〜大学生が理解できるレベルにする
- 各用語に3択クイズを1問ずつ作る
- 出力は必ず指定されたJSON形式のみにする

ユーザー情報：
- 学習済み用語: ${learnedTerms.length > 0 ? learnedTerms.join(", ") : "なし（初回学習）"}
- 苦手単語: ${weakTerms.length > 0 ? weakTerms.join(", ") : "なし"}
- 苦手カテゴリ: ${weakCategories.length > 0 ? weakCategories.join(", ") : "なし"}
- 直近の正解率: ${recentAccuracy}
- 今日の学習目標数: ${dailyGoal}個`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "AI request failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const text = aiData.content?.[0]?.text || "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(JSON.stringify({ error: "Invalid AI response format" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const courseData = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(courseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
