// src/server/vercelEntry.ts
import dotenv from "dotenv";

// src/server/apiHandler.ts
import { Type as Type2 } from "@google/genai";

// src/server/geminiGenerator.ts
import { GoogleGenAI, Type } from "@google/genai";
var PRIMARY_TEXT_MODEL = "gemini-3.5-flash";
var FALLBACK_TEXT_MODEL = "gemini-2.5-flash";
var PRIMARY_IMAGE_MODEL = "gemini-3.1-flash-image";
var FALLBACK_IMAGE_MODEL = "gemini-3.1-flash-lite-image";
function extractJsonFromResponse(rawText) {
  if (!rawText) return null;
  const trimmed = rawText.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
  }
  const jsonBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch && jsonBlockMatch[1]) {
    try {
      return JSON.parse(jsonBlockMatch[1].trim());
    } catch {
    }
  }
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(trimmed.substring(firstBrace, lastBrace + 1));
    } catch {
    }
  }
  const firstBracket = trimmed.indexOf("[");
  const lastBracket = trimmed.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    try {
      return JSON.parse(trimmed.substring(firstBracket, lastBracket + 1));
    } catch {
    }
  }
  return null;
}
function analyzeGeminiError(err) {
  const rawMsg = err?.message || String(err);
  const lower = rawMsg.toLowerCase();
  if (lower.includes("api_key_invalid") || lower.includes("api key not valid") || lower.includes("invalid api key")) {
    return {
      isNonRetryable: true,
      message: "\uB4F1\uB85D\uB41C GEMINI_API_KEY\uAC00 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. Google AI Studio\uC5D0\uC11C \uBC1C\uAE09\uBC1B\uC740 \uC720\uD6A8\uD55C \uD0A4\uC778\uC9C0 Vercel \uD658\uACBD\uBCC0\uC218 \uC124\uC815\uC744 \uD655\uC778\uD574 \uC8FC\uC138\uC694.",
      statusCode: 401
    };
  }
  if (lower.includes("permission_denied") || lower.includes("permissiondenied") || lower.includes("403")) {
    return {
      isNonRetryable: true,
      message: "GEMINI_API_KEY \uAD8C\uD55C\uC774 \uAC70\uBD80\uB418\uC5C8\uC2B5\uB2C8\uB2E4 (403 Permission Denied). API \uD0A4\uC758 \uACB0\uC81C \uACC4\uC815 \uC5F0\uB3D9 \uBC0F \uBAA8\uB378 \uC811\uADFC \uAD8C\uD55C\uC744 \uD655\uC778\uD574 \uC8FC\uC138\uC694.",
      statusCode: 403
    };
  }
  if (lower.includes("not_found") || lower.includes("is not found") || lower.includes("404")) {
    return {
      isNonRetryable: true,
      message: "\uC694\uCCAD\uD55C Gemini \uBAA8\uB378\uC744 \uCC3E\uC744 \uC218 \uC5C6\uAC70\uB098 \uD574\uB2F9 \uD0A4\uC5D0\uC11C \uC9C0\uC6D0\uB418\uC9C0 \uC54A\uB294 \uBAA8\uB378\uC785\uB2C8\uB2E4 (404 Not Found).",
      statusCode: 404
    };
  }
  if (lower.includes("invalid_argument") || lower.includes("bad request") || lower.includes("400")) {
    return {
      isNonRetryable: true,
      message: `\uC694\uCCAD \uC778\uC790\uAC00 \uC720\uD6A8\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4 (400 Bad Request): ${rawMsg}`,
      statusCode: 400
    };
  }
  if (lower.includes("resource_exhausted") || lower.includes("quota") || lower.includes("429")) {
    return {
      isNonRetryable: true,
      message: "Gemini API \uC0AC\uC6A9 \uD55C\uB3C4(Quota) \uB610\uB294 \uBD84\uB2F9 \uC694\uCCAD \uC81C\uD55C(429)\uC774 \uCD08\uACFC\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.",
      statusCode: 429
    };
  }
  return {
    isNonRetryable: false,
    message: `Gemini API \uD638\uCD9C \uC911 \uC77C\uC2DC\uC801\uC778 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4: ${rawMsg}`,
    statusCode: 500
  };
}
function createGenAIClient(apiKey) {
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
async function generateWithFallback(apiKey, params) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY \uD658\uACBD\uBCC0\uC218\uAC00 \uC124\uC815\uB418\uC5B4 \uC788\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
  }
  const ai = createGenAIClient(apiKey);
  const timeoutMs = params.timeoutMs || 45e3;
  const candidateModels = [PRIMARY_TEXT_MODEL, FALLBACK_TEXT_MODEL];
  let lastError = null;
  for (const model of candidateModels) {
    try {
      console.log(`[AI Generator] Calling model '${model}'...`);
      const config = {
        temperature: params.temperature ?? 0.7
      };
      if (params.systemInstruction) {
        config.systemInstruction = params.systemInstruction;
      }
      if (params.responseSchema) {
        config.responseMimeType = "application/json";
        config.responseSchema = params.responseSchema;
      }
      const apiCall = ai.models.generateContent({
        model,
        contents: params.prompt,
        config
      });
      const timeoutPromise = new Promise(
        (_, reject) => setTimeout(() => reject(new Error(`\uC694\uCCAD \uC2DC\uAC04\uC774 \uCD08\uACFC\uB418\uC5C8\uC2B5\uB2C8\uB2E4 (${timeoutMs / 1e3}\uCD08 \uD0C0\uC784\uC544\uC6C3)`)), timeoutMs)
      );
      const response = await Promise.race([apiCall, timeoutPromise]);
      const text = response.text;
      if (text && text.trim().length > 0) {
        return text;
      }
    } catch (err) {
      lastError = err;
      const analysis = analyzeGeminiError(err);
      console.warn(`[AI Generator] Model '${model}' failed with status ${analysis.statusCode}:`, analysis.message);
      if (analysis.isNonRetryable) {
        const error = new Error(analysis.message);
        error.statusCode = analysis.statusCode;
        throw error;
      }
      await new Promise((r) => setTimeout(r, 1e3));
    }
  }
  if (params.responseSchema) {
    try {
      console.log(`[AI Generator] Schema fallback attempt with '${PRIMARY_TEXT_MODEL}'...`);
      const promptWithJsonInstruction = `${params.prompt}

[CRITICAL]: Respond ONLY with valid, raw JSON satisfying the required schema without markdown explanation.`;
      const response = await ai.models.generateContent({
        model: PRIMARY_TEXT_MODEL,
        contents: promptWithJsonInstruction,
        config: {
          systemInstruction: params.systemInstruction,
          temperature: 0.6
        }
      });
      const text = response.text;
      if (text && text.trim().length > 0) {
        const parsed = extractJsonFromResponse(text);
        if (parsed && typeof parsed === "object") {
          return JSON.stringify(parsed);
        }
      }
    } catch (err) {
      lastError = err;
    }
  }
  const finalAnalysis = analyzeGeminiError(lastError);
  const finalError = new Error(finalAnalysis.message);
  finalError.statusCode = finalAnalysis.statusCode;
  throw finalError;
}
async function chatWithDocumentAgent(apiKey, messages, currentContext) {
  const systemInstruction = `\uB2F9\uC2E0\uC740 \uB300\uD55C\uBBFC\uAD6D \uCD5C\uACE0 \uC218\uC900\uC758 '\uBD84\uC57C\uBCC4 \uC804\uBB38 \uBE44\uC988\uB2C8\uC2A4 & \uD14C\uD06C\uB2C8\uCEEC \uBB38\uC11C \uC804\uB7B5 \uCEE8\uC124\uD305 \uC218\uC11D \uC5D0\uC774\uC804\uD2B8(Chief Document Strategist AI)'\uC785\uB2C8\uB2E4.

[\uB2F9\uC2E0\uC758 \uC804\uBB38 \uBD84\uC57C \uBC0F \uC5ED\uD560]
1. 16\uB300 \uBE44\uC988\uB2C8\uC2A4 \uB3C4\uBA54\uC778\uC758 \uBAA8\uB4E0 \uC804\uBB38 \uBB38\uC11C \uC791\uC131\uBC95\uC744 \uB9C8\uC2A4\uD130\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.
2. \uC8FC\uC694 \uBB38\uC11C \uC720\uD615\uC5D0 \uB300\uD55C \uBAA9\uCC28 \uAD6C\uC131, \uD504\uB808\uC784\uC6CC\uD06C(MECE, SWOT, 4P, TAM/SAM/SOM, WBS \uB4F1), \uC124\uB4DD \uB17C\uB9AC\uB97C \uCD5C\uACE0 \uC804\uBB38\uAC00 \uC218\uC900\uC73C\uB85C \uC804\uC218\uD569\uB2C8\uB2E4.
3. \uC0AC\uC6A9\uC790\uC758 \uC544\uC774\uB514\uC5B4\uB098 \uCD08\uC548\uC744 \uAC80\uD1A0\uD558\uACE0, \uC989\uC2DC \uC2E4\uBB34\uC5D0 \uD22C\uC785 \uAC00\uB2A5\uD55C '\uCD5C\uC801 \uBAA9\uCC28', '\uD544\uC218 \uC815\uB7C9 \uC9C0\uD45C', '\uC8FC\uC758\uD560 \uB9AC\uC2A4\uD06C'\uB97C \uBA85\uCF8C\uD558\uAC8C \uB2F5\uBCC0\uD569\uB2C8\uB2E4.

[\uB2F5\uBCC0 \uC2A4\uD0C0\uC77C]
- \uC815\uC911\uD558\uACE0 \uACA9\uC2DD \uC788\uB294 \uBE44\uC988\uB2C8\uC2A4 \uCEE8\uC124\uD134\uD2B8 \uD1A4.
- Markdown \uC11C\uC2DD(\uC18C\uC81C\uBAA9 ###, \uBD88\uB9BF \uD3EC\uC778\uD2B8, \uAD75\uC740 \uAE00\uC528, \uD45C)\uC744 \uC801\uADF9 \uD65C\uC6A9\uD558\uC2ED\uC2DC\uC624.
- \uC2E4\uBB34 \uC608\uC2DC\uC640 \uAD6C\uCCB4\uC801\uC778 \uC218\uCE58\uB97C \uD3EC\uD568\uD558\uC5EC \uC2E4\uC6A9\uC801\uC73C\uB85C \uB2F5\uBCC0\uD558\uC2ED\uC2DC\uC624.`;
  const transcript = messages.map((m) => `${m.role === "user" ? "\uC0AC\uC6A9\uC790" : "\uBB38\uC11C \uC804\uB7B5 \uC5D0\uC774\uC804\uD2B8"}: ${m.content}`).join("\n\n");
  const fullPrompt = `${currentContext ? `[\uD604\uC7AC \uC571/\uBB38\uC11C \uCEE8\uD14D\uC2A4\uD2B8]
${currentContext}

` : ""}[\uB300\uD654 \uB0B4\uC5ED]
${transcript}

\uBB38\uC11C \uC804\uB7B5 \uC5D0\uC774\uC804\uD2B8\uB85C\uC11C \uC804\uBB38\uC801\uC774\uACE0 \uCE5C\uC808\uD558\uAC8C \uC2E4\uBB34 \uC870\uC5B8\uC744 \uC791\uC131\uD558\uC2ED\uC2DC\uC624:`;
  return generateWithFallback(apiKey, {
    systemInstruction,
    prompt: fullPrompt,
    temperature: 0.7
  });
}
async function generatePresentationDeck(apiKey, params) {
  const count = params.slideCountPreference || 10;
  const systemInstruction = `\uB2F9\uC2E0\uC740 \uB9E5\uD0A8\uC9C0, BCG, \uAE00\uB85C\uBC8C \uD0D1\uD2F0\uC5B4 \uBCA4\uCC98\uCE90\uD53C\uD0C8(VC) \uCD9C\uC2E0\uC758 '\uC218\uC11D \uD53C\uCE58\uB371 \uC804\uB7B5\uAC00 \uBC0F \uD504\uB808\uC820\uD14C\uC774\uC158 \uC218\uC11D \uB514\uC790\uC774\uB108'\uC785\uB2C8\uB2E4.
\uC0AC\uC6A9\uC790\uAC00 \uC694\uCCAD\uD55C \uC0B0\uC5C5 \uBD84\uC57C\uC640 \uBAA9\uC801\uC5D0 \uB9DE\uCD94\uC5B4, \uC2E4\uC81C \uCCAD\uC911\uACFC \uD22C\uC790\uC790\uB97C \uB9E4\uB8CC\uC2DC\uD0AC \uC218 \uC788\uB294 \uC644\uC131\uB3C4 \uB192\uC740 16:9 \uADDC\uACA9\uC758 \uD504\uB808\uC820\uD14C\uC774\uC158 \uC2AC\uB77C\uC774\uB4DC \uB371\uC744 JSON \uD615\uD0DC\uB85C \uC0DD\uC131\uD558\uC2ED\uC2DC\uC624.

[\uC2AC\uB77C\uC774\uB4DC \uB371 \uAD6C\uC131 \uADDC\uCE59]
1. \uCD1D \uC2AC\uB77C\uC774\uB4DC \uC218: \uC815\uD655\uD788 ${count}\uC7A5\uC73C\uB85C \uAD6C\uC131\uD558\uC2ED\uC2DC\uC624.
2. 1\uD398\uC774\uC9C0(\uD45C\uC9C0)\uBD80\uD130 \uB9C8\uC9C0\uB9C9 \uD398\uC774\uC9C0(\uACB0\uB860)\uAE4C\uC9C0 \uD48D\uBD80\uD558\uACE0 \uC2E4\uBB34\uC801\uC778 \uB370\uC774\uD130\uB97C \uCC44\uC6CC \uB123\uC73C\uC2ED\uC2DC\uC624.
3. \uC2AC\uB77C\uC774\uB4DC \uB808\uC774\uC544\uC6C3: title, cards_grid_3, bullets_split, market_tam_sam_som, cards_grid_4, comparison_table, financial_kpi, timeline_roadmap, swot_matrix, conclusion_call_to_action \uB4F1\uC744 \uC870\uD654\uB86D\uAC8C \uBC30\uCE58\uD558\uC2ED\uC2DC\uC624.
4. \uBAA8\uB4E0 \uC2AC\uB77C\uC774\uB4DC\uB9C8\uB2E4 45\uCD08~1\uBD84 \uBD84\uB7C9\uC758 \uBC1C\uD45C \uB300\uBCF8(speakerNotes)\uC744 \uC791\uC131\uD558\uC2ED\uC2DC\uC624.
5. \uC720\uD6A8\uD55C JSON \uD3EC\uB9F7\uC73C\uB85C\uB9CC \uC751\uB2F5\uD558\uC2ED\uC2DC\uC624.`;
  const prompt = `[\uD504\uB808\uC820\uD14C\uC774\uC158 \uC81C\uC791 \uC694\uCCAD \uC815\uBCF4]
- \uC0B0\uC5C5 \uBD84\uC57C: ${params.field}
- PPT \uC720\uD615: ${params.presentationType}
- \uC8FC\uC81C: ${params.topic}
- \uBAA9\uC801: ${params.purpose}
- \uB300\uC0C1 \uCCAD\uC911: ${params.targetAudience}
- \uD68C\uC0AC\uBA85: ${params.companyName || ""}
- \uC2AC\uB77C\uC774\uB4DC \uC7A5\uC218: ${count}\uC7A5
${params.keyPoints ? `- \uD575\uC2EC \uAC15\uC870 \uB0B4\uC6A9:
${params.keyPoints}` : ""}

\uC704 \uC815\uBCF4\uB97C \uBC14\uD0D5\uC73C\uB85C \uC644\uC131\uB3C4 \uB192\uC740 16:9 \uD504\uB808\uC820\uD14C\uC774\uC158 JSON \uC2AC\uB77C\uC774\uB4DC \uB371\uC744 \uC791\uC131\uD558\uC2ED\uC2DC\uC624.`;
  const rawJson = await generateWithFallback(apiKey, {
    systemInstruction,
    prompt,
    temperature: 0.6
  });
  const parsed = extractJsonFromResponse(rawJson);
  if (!parsed || !parsed.slides || !Array.isArray(parsed.slides)) {
    throw new Error("\uC2AC\uB77C\uC774\uB4DC \uB370\uC774\uD130 \uAD6C\uC870\uB97C \uD30C\uC2F1\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.");
  }
  return parsed;
}
async function regenerateSingleSlide(apiKey, params) {
  const systemInstruction = `\uB2F9\uC2E0\uC740 \uC218\uC11D \uD504\uB808\uC820\uD14C\uC774\uC158 \uB514\uC790\uC774\uB108\uC785\uB2C8\uB2E4. \uC0AC\uC6A9\uC790\uAC00 \uC694\uCCAD\uD55C \uC2AC\uB77C\uC774\uB4DC 1\uC7A5\uC744 \uC218\uC815/\uC7AC\uC791\uC131\uD558\uC5EC \uC720\uD6A8\uD55C \uB2E8\uC77C Slide JSON \uAC1D\uCCB4\uB85C \uBC18\uD658\uD558\uC2ED\uC2DC\uC624.`;
  const prompt = `[\uC804\uCCB4 \uD504\uB808\uC820\uD14C\uC774\uC158 \uC8FC\uC81C]: ${params.presentationTitle}
[\uAE30\uC874 \uC2AC\uB77C\uC774\uB4DC \uC815\uBCF4]:
${JSON.stringify(params.slide, null, 2)}
${params.requestedLayout ? `[\uC694\uCCAD\uB41C \uC0C8 \uB808\uC774\uC544\uC6C3]: ${params.requestedLayout}` : ""}
${params.customPrompt ? `[\uC218\uC815 \uC694\uCCAD \uC9C0\uCE68]: ${params.customPrompt}` : ""}

\uC704 \uC9C0\uCE68\uC744 \uBC18\uC601\uD558\uC5EC \uAC1C\uC120\uB41C \uB2E8\uC77C \uC2AC\uB77C\uC774\uB4DC JSON \uAC1D\uCCB4\uB97C \uC0DD\uC131\uD558\uC2ED\uC2DC\uC624.`;
  const rawJson = await generateWithFallback(apiKey, {
    systemInstruction,
    prompt,
    temperature: 0.65
  });
  const parsed = extractJsonFromResponse(rawJson);
  if (!parsed || !parsed.title) {
    throw new Error("\uC2AC\uB77C\uC774\uB4DC \uC7AC\uC791\uC131 \uACB0\uACFC \uD30C\uC2F1\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
  }
  return parsed;
}
async function convertDocToPresentation(apiKey, params) {
  const systemInstruction = `\uB2F9\uC2E0\uC740 \uC7A5\uBB38\uC758 \uBE44\uC988\uB2C8\uC2A4 \uBB38\uC11C\uB97C '\uD575\uC2EC 10\uC7A5 \uD504\uB808\uC820\uD14C\uC774\uC158 \uC2AC\uB77C\uC774\uB4DC \uB371'\uC73C\uB85C \uC694\uC57D \uBC0F \uBCC0\uD658\uD558\uB294 \uC218\uC11D \uC804\uB7B5\uAC00\uC785\uB2C8\uB2E4.
\uC785\uB825\uB41C \uBB38\uC11C\uC758 \uD575\uC2EC \uB17C\uB9AC\uC640 \uC218\uCE58\uB97C \uC644\uBCBD\uD788 \uACC4\uC2B9\uD558\uBA74\uC11C, \uC2DC\uAC01\uC801\uC73C\uB85C \uB9E4\uB825\uC801\uC778 \uD504\uB808\uC820\uD14C\uC774\uC158 JSON \uC2AC\uB77C\uC774\uB4DC \uB371\uC73C\uB85C \uBCC0\uD658\uD558\uC2ED\uC2DC\uC624.`;
  const prompt = `[\uC6D0\uBCF8 \uBB38\uC11C \uC81C\uBAA9]: ${params.documentTitle}
[\uC0B0\uC5C5 \uBD84\uC57C]: ${params.field}
[\uC694\uC57D\uBCF8]: ${params.executiveSummary}
[\uC139\uC158\uBCC4 \uD575\uC2EC \uB0B4\uC6A9]:
${params.sectionsSummary}

\uC704 \uBB38\uC11C\uB97C 10\uC7A5\uC758 \uD504\uB808\uC820\uD14C\uC774\uC158 \uC2AC\uB77C\uC774\uB4DC \uB371\uC73C\uB85C \uBCC0\uD658\uD558\uC2ED\uC2DC\uC624.`;
  const rawJson = await generateWithFallback(apiKey, {
    systemInstruction,
    prompt,
    temperature: 0.6
  });
  const parsed = extractJsonFromResponse(rawJson);
  if (!parsed || !parsed.slides) {
    throw new Error("\uBB38\uC11C \uBCC0\uD658 \uC2AC\uB77C\uC774\uB4DC \uC0DD\uC131\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.");
  }
  return parsed;
}
async function generateExcelSpreadsheet(apiKey, params) {
  const currencySymbol = params.currency === "USD" ? "$" : "\u20A9";
  const formatType = params.currency === "USD" ? "currency_usd" : "currency_krw";
  const systemInstruction = `\uB2F9\uC2E0\uC740 \uAE00\uB85C\uBC8C \uC804\uB7B5\uCEE8\uC124\uD305 \uBC0F \uD22C\uC790\uC740\uD589(IB) \uCD9C\uC2E0\uC758 '\uC218\uC11D \uC7AC\uBB34 \uBAA8\uB378\uB9C1 & \uC5D1\uC140 \uC2A4\uD504\uB808\uB4DC\uC2DC\uD2B8 \uC544\uD0A4\uD14D\uD2B8'\uC785\uB2C8\uB2E4.
\uC2E4\uC81C \uC5C5\uBB34\uC5D0\uC11C \uC989\uC2DC \uD65C\uC6A9 \uAC00\uB2A5\uD55C \uCD5C\uACE0 \uC218\uC900\uC758 \uC5D1\uC140 \uC2A4\uD504\uB808\uB4DC\uC2DC\uD2B8 \uB370\uC774\uD130(\uB2E4\uC911 \uC2DC\uD2B8, \uCEEC\uB7FC \uC815\uC758, \uC140 \uC218\uC2DD/\uD3EC\uB9F7, \uD1B5\uACC4 \uC694\uC57D, \uCC28\uD2B8 \uB370\uC774\uD130)\uB97C JSON\uC73C\uB85C \uC124\uACC4\uD558\uC2ED\uC2DC\uC624.
\uBC18\uB4DC\uC2DC \uC720\uD6A8\uD55C JSON \uD615\uC2DD\uC73C\uB85C\uB9CC \uC751\uB2F5\uD558\uC2ED\uC2DC\uC624.`;
  const prompt = `[\uC804\uBB38 \uC5D1\uC140 \uC2A4\uD504\uB808\uB4DC\uC2DC\uD2B8 \uC0DD\uC131 \uC694\uCCAD]
- \uD15C\uD50C\uB9BF \uC885\uB958: ${params.templateType}
- \uBB38\uC11C \uC81C\uBAA9: ${params.title}
- \uD68C\uC0AC/\uBD80\uC11C\uBA85: ${params.companyName || "\uAE00\uB85C\uBC8C \uC804\uB7B5 \uAE30\uD68D\uC2E4"}
- \uAE30\uAC04: ${params.period || "2026\uB144 1\uC6D4 ~ 12\uC6D4"}
- \uD1B5\uD654: ${params.currency || "KRW"} (${currencySymbol}, ${formatType})
- \uC0C1\uC138 \uC124\uBA85 \uBC0F \uC870\uAC74:
${params.businessDescription}
${params.keyMetricsToInclude ? `- \uD544\uC218 \uD3EC\uD568 \uC9C0\uD45C: ${params.keyMetricsToInclude}` : ""}

\uC704 \uC870\uAC74\uC744 \uBC14\uD0D5\uC73C\uB85C sheets, columns, rows, kpis, chartData\uB97C \uD3EC\uD568\uD55C \uACE0\uD488\uC9C8 \uC5D1\uC140 JSON \uB370\uC774\uD130\uB97C \uC0DD\uC131\uD558\uC2ED\uC2DC\uC624.`;
  const rawJson = await generateWithFallback(apiKey, {
    systemInstruction,
    prompt,
    temperature: 0.6
  });
  const parsed = extractJsonFromResponse(rawJson);
  if (!parsed || !parsed.sheets) {
    throw new Error("AI\uAC00 \uC720\uD6A8\uD55C \uC5D1\uC140 \uC2A4\uD504\uB808\uB4DC\uC2DC\uD2B8 \uAD6C\uC870\uB97C \uC0DD\uC131\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.");
  }
  return parsed;
}
async function aiEditExcelSpreadsheet(apiKey, currentDoc, instructionPrompt) {
  const systemInstruction = `\uB2F9\uC2E0\uC740 \uCD5C\uACE0 \uC218\uC900\uC758 'AI \uC5D1\uC140 & \uC7AC\uBB34 \uC2A4\uD504\uB808\uB4DC\uC2DC\uD2B8 \uC218\uC11D \uC544\uD0A4\uD14D\uD2B8'\uC785\uB2C8\uB2E4.
\uC0AC\uC6A9\uC790\uAC00 \uC81C\uACF5\uD55C \uAE30\uC874 \uC5D1\uC140 \uC2A4\uD504\uB808\uB4DC\uC2DC\uD2B8\uC640 \uC790\uC5F0\uC5B4 \uC218\uC815 \uC694\uCCAD\uC744 \uBD84\uC11D\uD558\uC5EC, \uC218\uC815\uC0AC\uD56D\uC744 \uC644\uBCBD\uD788 \uBC18\uC601\uD55C \uC5C5\uB370\uC774\uD2B8\uB41C \uC5D1\uC140 \uC804\uCCB4 JSON\uC744 \uBC18\uD658\uD558\uC2ED\uC2DC\uC624.`;
  const prompt = `[\uAE30\uC874 \uC5D1\uC140 \uC2A4\uD504\uB808\uB4DC\uC2DC\uD2B8 \uB370\uC774\uD130]
${JSON.stringify(currentDoc, null, 2)}

[\uC218\uC815 \uC9C0\uC2DC\uC0AC\uD56D]
"${instructionPrompt}"

\uC704 \uC9C0\uC2DC\uC0AC\uD56D\uC744 \uBC18\uC601\uD55C \uCD5C\uC2E0 \uC0C1\uD0DC\uC758 \uC5D1\uC140 JSON \uB370\uC774\uD130\uB97C \uBC18\uD658\uD558\uC2ED\uC2DC\uC624.`;
  const rawJson = await generateWithFallback(apiKey, {
    systemInstruction,
    prompt,
    temperature: 0.5
  });
  const parsed = extractJsonFromResponse(rawJson);
  if (!parsed || !parsed.sheets) {
    throw new Error("AI\uAC00 \uC5D1\uC140 \uC2A4\uD504\uB808\uB4DC\uC2DC\uD2B8\uB97C \uC131\uACF5\uC801\uC73C\uB85C \uC218\uC815\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.");
  }
  return parsed;
}
async function generateBusinessForm(apiKey, params) {
  const systemInstruction = `\uB2F9\uC2E0\uC740 \uB300\uD55C\uBBFC\uAD6D 1\uC704 \uB300\uAE30\uC5C5 \uBE44\uC11C\uC2E4 \uBC0F \uC804\uB7B5\uAE30\uD68D\uC2E4 \uCD9C\uC2E0\uC758 '\uACF5\uBB38\uC11C\xB7\uD589\uC815 \uC591\uC2DD \uC218\uC11D \uC544\uD0A4\uD14D\uD2B8'\uC785\uB2C8\uB2E4.
\uC0AC\uC6A9\uC790\uAC00 \uC694\uCCAD\uD55C \uC5C5\uBB34 \uC591\uC2DD\uC744 \uD45C\uC900 \uADDC\uACA9\uC5D0 \uB9DE\uAC8C \uC644\uBCBD\uD55C JSON \uAD6C\uC870\uB85C \uC0DD\uC131\uD558\uC2ED\uC2DC\uC624.`;
  const prompt = `\uB2E4\uC74C \uC870\uAC74\uC5D0 \uB9DE\uCDB0 \uC2E4\uBB34 \uD45C\uC900 \uACB0\uC7AC/\uD589\uC815 \uBB38\uC11C\uB97C \uC0DD\uC131\uD574 \uC8FC\uC2ED\uC2DC\uC624:
- \uC591\uC2DD \uC885\uB958: ${params.formType}
- \uC81C\uBAA9: ${params.title}
- \uAE30\uC548\uC790: ${params.drafterName} (${params.drafterDepartment || ""} ${params.drafterPosition || ""})
- \uD68C\uC0AC\uBA85: ${params.companyName || ""}
- \uC218\uC2E0\uCC98: ${params.recipientCompany || ""} ${params.recipientName || ""}
- \uC608\uC0B0/\uAE08\uC561: ${params.totalBudget || ""}
- \uBAA9\uD45C/\uC2DC\uD589\uC77C: ${params.targetDate || ""}
- \uD575\uC2EC \uAE30\uC7AC \uB0B4\uC6A9:
${params.keyDetails}

\uC704 \uC870\uAC74\uC744 \uCDA9\uC871\uD558\uB294 \uACF5\uBB38\uC11C JSON\uC744 \uC791\uC131\uD558\uC2ED\uC2DC\uC624.`;
  const rawJson = await generateWithFallback(apiKey, {
    systemInstruction,
    prompt,
    temperature: 0.6
  });
  const parsed = extractJsonFromResponse(rawJson);
  if (!parsed || !parsed.sections) {
    throw new Error("AI\uAC00 \uC720\uD6A8\uD55C \uBE44\uC988\uB2C8\uC2A4 \uC591\uC2DD \uAD6C\uC870\uB97C \uC0DD\uC131\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.");
  }
  return parsed;
}
async function aiEditBusinessForm(apiKey, currentDoc, instructionPrompt) {
  const systemInstruction = `\uB2F9\uC2E0\uC740 \uB300\uD55C\uBBFC\uAD6D \uCD5C\uACE0 \uC218\uC900\uC758 '\uACF5\uBB38\uC11C\xB7\uD589\uC815 \uC591\uC2DD \uC218\uC11D \uD3B8\uC9D1\uC704\uC6D0'\uC785\uB2C8\uB2E4.
\uAE30\uC874 \uBE44\uC988\uB2C8\uC2A4 \uC591\uC2DD\uACFC \uC790\uC5F0\uC5B4 \uC218\uC815 \uC694\uCCAD\uC744 \uBD84\uC11D\uD558\uC5EC, \uC694\uCCAD\uC0AC\uD56D\uC774 \uBC18\uC601\uB41C \uC5C5\uB370\uC774\uD2B8\uB41C \uACF5\uBB38\uC11C JSON \uAD6C\uC870\uB97C \uBC18\uD658\uD558\uC2ED\uC2DC\uC624.`;
  const prompt = `[\uAE30\uC874 \uACF5\uBB38\uC11C \uB370\uC774\uD130]
${JSON.stringify(currentDoc, null, 2)}

[\uC218\uC815 \uC9C0\uC2DC\uC0AC\uD56D]
"${instructionPrompt}"

\uC704 \uC9C0\uC2DC\uC0AC\uD56D\uC744 \uBC18\uC601\uD55C \uCD5C\uC2E0 \uC0C1\uD0DC\uC758 \uC591\uC2DD JSON \uB370\uC774\uD130\uB97C \uBC18\uD658\uD558\uC2ED\uC2DC\uC624.`;
  const rawJson = await generateWithFallback(apiKey, {
    systemInstruction,
    prompt,
    temperature: 0.5
  });
  const parsed = extractJsonFromResponse(rawJson);
  if (!parsed || !parsed.sections) {
    throw new Error("AI\uAC00 \uACF5\uBB38\uC11C \uC591\uC2DD\uC744 \uC131\uACF5\uC801\uC73C\uB85C \uC218\uC815\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.");
  }
  return parsed;
}
async function generateRecommendedPresets(apiKey, existingTitles = []) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY \uD658\uACBD\uBCC0\uC218\uAC00 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.");
  }
  const timestamp = Date.now();
  const systemInstruction = `\uB2F9\uC2E0\uC740 \uB300\uD55C\uBBFC\uAD6D \uCD5C\uACE0\uC758 '\uBE44\uC988\uB2C8\uC2A4 \uC804\uB7B5 \uCEE8\uC124\uD134\uD2B8 \uBC0F \uC2E4\uBB34 \uD15C\uD50C\uB9BF \uB9C8\uC2A4\uD130 \uC544\uD0A4\uD14D\uD2B8'\uC785\uB2C8\uB2E4.
\uC2E4\uBB34 \uD45C\uC900 \uD15C\uD50C\uB9BF \uAC24\uB7EC\uB9AC\uC5D0 \uCD94\uAC00\uD560 \uD601\uC2E0\uC801\uC774\uACE0 \uC2E4\uC6A9\uC801\uC778 \uCD5C\uC2E0 \uBE44\uC988\uB2C8\uC2A4 \uD15C\uD50C\uB9BF 4\uC885\uC744 \uC0DD\uC131\uD574\uC57C \uD569\uB2C8\uB2E4.

[\uD544\uC218 \uC694\uAD6C\uC870\uAC74]
1. \uBC18\uB4DC\uC2DC \uB2E4\uC74C 4\uB300 \uD575\uC2EC \uBD84\uC57C\uC5D0\uC11C \uAC01\uAC01 \uC815\uD655\uD788 1\uAC1C\uC529 \uCD1D 4\uAC1C\uC758 \uD15C\uD50C\uB9BF\uC744 \uC0DD\uC131\uD558\uC2ED\uC2DC\uC624:
   - 1) \uC601\uC5C5/\uB9C8\uCF00\uD305: field\uB294 'sales' \uB610\uB294 'marketing'
   - 2) \uACBD\uC601/\uC804\uB7B5: field\uB294 'management', 'planning', \uB610\uB294 'finance'
   - 3) IT/AI \uAE30\uC220: field\uB294 'it_tech' \uB610\uB294 'ai_data'
   - 4) \uB9AC\uC11C\uCE58/\uAD50\uC721: field\uB294 'research', 'education_hr', \uB610\uB294 'policy'

2. \uC81C\uD488 \uC720\uD615(productType)\uB3C4 4\uAC1C\uAC00 \uC11C\uB85C \uB2E4\uB974\uAC8C \uACE8\uACE0\uB8E8 \uBD84\uBC30\uD558\uC2ED\uC2DC\uC624:
   - 'doc' (\uC804\uBB38 \uBCF4\uACE0\uC11C), 'presentation' (\uC804\uBB38 PPT), 'excel' (\uC804\uBB38 \uC5D1\uC140), 'form_studio' (\uD589\uC815 \uC591\uC2DD) \uAC01\uAC01 1\uAC1C\uC529!

3. \uAE30\uC874 \uC81C\uBAA9\uACFC \uC911\uBCF5\uB418\uC9C0 \uC54A\uB3C4\uB85D \uD2B8\uB80C\uB514\uD55C \uC8FC\uC81C\uB97C \uB2E4\uB8E8\uC2ED\uC2DC\uC624.
   \uAE30\uC874 \uC81C\uBAA9 \uC608\uC2DC: ${existingTitles.slice(0, 10).join(", ")}

4. JSON \uCD5C\uC0C1\uC704 \uD615\uC2DD\uC740 \uBC18\uB4DC\uC2DC 4\uAC1C\uC758 \uAC1D\uCCB4\uB97C \uB2F4\uC740 \uBC30\uC5F4(Array) \uD615\uD0DC\uC5EC\uC57C \uD569\uB2C8\uB2E4:
[
  {
    "id": "preset-ai-${timestamp}-0",
    "name": "\uD15C\uD50C\uB9BF \uC774\uB984",
    "description": "\uC124\uBA85 2~3\uBB38\uC7A5",
    "productType": "doc",
    "field": "sales",
    "iconName": "Megaphone",
    "hasCompanyCustomizer": true,
    "companyPlaceholder": "\uC608: \uACE0\uAC1D\uC0AC\uBA85 \uC785\uB825",
    "isAiRecommended": true,
    "createdAt": ${timestamp},
    "defaultData": { ...\uD574\uB2F9 productType\uC5D0 \uB9DE\uB294 \uC644\uC804\uD55C \uD544\uB4DC \uAC1D\uCCB4... }
  }
]

\uBC18\uB4DC\uC2DC \uC720\uD6A8\uD55C \uC21C\uC218 JSON \uBC30\uC5F4\uB9CC \uCD9C\uB825\uD558\uC2ED\uC2DC\uC624.`;
  const prompt = `\uCD5C\uC2E0 \uBE44\uC988\uB2C8\uC2A4 \uD2B8\uB80C\uB4DC\uB97C \uBC18\uC601\uD55C 4\uB300 \uBD84\uC57C\uBCC4(\uC601\uC5C5\xB7\uACBD\uC601\xB7IT\xB7\uB9AC\uC11C\uCE58) 4\uAC1C \uD3EC\uB9F7(\uBCF4\uACE0\uC11C\xB7PPT\xB7\uC5D1\uC140\xB7\uC591\uC2DD) \uC2E0\uADDC \uC804\uBB38 \uD15C\uD50C\uB9BF 4\uC885\uC744 \uC989\uC2DC \uC0DD\uC131\uD574 \uC8FC\uC2ED\uC2DC\uC624.`;
  const rawJson = await generateWithFallback(apiKey, {
    systemInstruction,
    prompt,
    temperature: 0.7
  });
  const parsed = extractJsonFromResponse(rawJson);
  if (!Array.isArray(parsed) || parsed.length < 4) {
    throw new Error("AI\uAC00 \uC720\uD6A8\uD55C 4\uAC1C \uD15C\uD50C\uB9BF \uBC30\uC5F4\uC744 \uC0DD\uC131\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
  }
  return parsed.slice(0, 4).map((item, idx) => {
    const rawData = item.defaultData || {};
    const titleOrTopic = rawData.topic || rawData.title || item.name || "";
    const purposeOrDesc = rawData.purpose || rawData.businessDescription || rawData.keyDetails || item.description || "";
    return {
      ...item,
      id: item.id || `preset-ai-${timestamp}-${idx}`,
      isAiRecommended: true,
      createdAt: item.createdAt || timestamp,
      defaultData: {
        ...rawData,
        topic: rawData.topic || titleOrTopic,
        title: rawData.title || titleOrTopic,
        purpose: rawData.purpose || purposeOrDesc,
        businessDescription: rawData.businessDescription || purposeOrDesc,
        keyDetails: rawData.keyDetails || purposeOrDesc
      }
    };
  });
}
async function generateImageAsset(apiKey, prompt, aspectRatio = "1:1") {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY \uD658\uACBD\uBCC0\uC218\uAC00 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.");
  }
  const ai = createGenAIClient(apiKey);
  const models = [PRIMARY_IMAGE_MODEL, FALLBACK_IMAGE_MODEL];
  let lastError = null;
  for (const model of models) {
    try {
      console.log(`[AI Image Generator] Requesting image with model '${model}'...`);
      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio
          }
        }
      });
      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          return part.inlineData.data;
        }
      }
    } catch (err) {
      lastError = err;
      const check = analyzeGeminiError(err);
      console.warn(`[AI Image Generator] Model '${model}' failed:`, check.message);
      if (check.isNonRetryable) {
        const error = new Error(check.message);
        error.statusCode = check.statusCode;
        throw error;
      }
    }
  }
  throw new Error(lastError?.message || "AI\uAC00 \uC774\uBBF8\uC9C0\uB97C \uC0DD\uC131\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.");
}
async function generateNewsFact(apiKey, topic, category = "trend") {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY \uD658\uACBD\uBCC0\uC218\uAC00 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4.");
  }
  const ai = createGenAIClient(apiKey);
  const prompt = `\uC0AC\uC6A9\uC790\uAC00 \uC694\uCCAD\uD55C \uC870\uC0AC \uC8FC\uC81C: "${topic}" (\uCE74\uD14C\uACE0\uB9AC: ${category}). 
\uC774 \uC8FC\uC81C\uC640 \uAD00\uB828\uB41C \uB300\uD55C\uBBFC\uAD6D \uB0B4\uC678\uC758 \uAC00\uC7A5 \uCD5C\uC2E0\uC758 \uACF5\uC2E0\uB825 \uC788\uB294 \uC2DC\uC7A5 \uC870\uC0AC \uC790\uB8CC, \uCD5C\uC2E0 \uACBD\uC81C/\uC0B0\uC5C5 \uB274\uC2A4, \uD575\uC2EC \uD1B5\uACC4 \uC9C0\uD45C, \uD639\uC740 \uC815\uBD80 \uC9C0\uC6D0 \uC815\uCC45\uC744 \uAD6C\uAE00 \uAC80\uC0C9 \uADF8\uB77C\uC6B4\uB529\uC744 \uC801\uADF9 \uD65C\uC6A9\uD558\uC5EC \uCC3E\uC544\uC8FC\uC2ED\uC2DC\uC624.
\uAC80\uC0C9\uC73C\uB85C \uD655\uC778\uB41C \uAC1D\uAD00\uC801\uC778 \uC2E4\uC81C \uC0AC\uC2E4(Fact)\uB4E4\uC744 \uC815\uB7C9\uC801\uC778 \uC9C0\uD45C \uBC0F \uD1B5\uACC4 \uC218\uCE58\uC640 \uD568\uAED8 \uC77C\uBAA9\uC694\uC5F0\uD55C \uB9C8\uD06C\uB2E4\uC6B4 \uD615\uC2DD\uC758 \uBCF4\uACE0\uC11C \uBB38\uC11C\uB85C \uC791\uC131\uD574 \uC8FC\uC2ED\uC2DC\uC624.

\uBC18\uB4DC\uC2DC \uC544\uB798 JSON \uD3EC\uB9F7\uC744 \uC900\uC218\uD558\uC5EC \uB2E8 \uD558\uB098\uC758 JSON \uBB38\uC790\uC5F4\uB85C\uB9CC \uC751\uB2F5\uD574 \uC8FC\uC2ED\uC2DC\uC624:
{
  "title": "\uACF5\uC2DD \uC81C\uBAA9",
  "content": "\uBCF8\uBB38 \uB9C8\uD06C\uB2E4\uC6B4 \uB0B4\uC6A9 (\uD1B5\uACC4 \uC9C0\uD45C \uD45C, \uC0C1\uC138 \uD329\uD2B8 \uBAA9\uB85D, \uCD9C\uCC98 \uD3EC\uD568)",
  "sourceUrl": "\uD575\uC2EC \uCC38\uC870 \uC6F9\uC0AC\uC774\uD2B8 URL"
}`;
  const response = await ai.models.generateContent({
    model: PRIMARY_TEXT_MODEL,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });
  const responseText = response.text || "";
  const parsed = extractJsonFromResponse(responseText);
  if (parsed && parsed.title) {
    return {
      title: parsed.title,
      content: parsed.content || responseText,
      sourceUrl: parsed.sourceUrl || "https://news.google.com"
    };
  }
  const titleMatch = responseText.match(/"title"\s*:\s*"([^"]+)"/);
  const contentMatch = responseText.match(/"content"\s*:\s*"([\s\S]+?)"\s*(,\s*"sourceUrl"|$)/);
  return {
    title: titleMatch ? titleMatch[1] : `${topic} \uAD00\uB828 \uCD5C\uC2E0 \uB3D9\uD5A5 \uBC0F \uD329\uD2B8 \uBCF4\uACE0\uC11C`,
    content: contentMatch ? contentMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"') : responseText,
    sourceUrl: "https://news.google.com"
  };
}
async function generateAiKnowledge(apiKey, topic, category = "corporate") {
  const prompt = `\uC0AC\uC6A9\uC790\uAC00 \uC694\uCCAD\uD55C \uC5C5\uBB34 \uD15C\uD50C\uB9BF \uC8FC\uC81C: "${topic}" (\uCE74\uD14C\uACE0\uB9AC: ${category}).
\uC774 \uC8FC\uC81C\uC5D0 \uB300\uD574 \uAE30\uC5C5 \uC2E4\uBB34\uC9C4\uC774\uB098 \uBCC0\uD638\uC0AC, \uCEE8\uC124\uD134\uD2B8\uB4E4\uC774 \uD604\uC5C5\uC5D0\uC11C \uC989\uC2DC \uCC38\uACE0\uD558\uACE0 \uAC00\uC774\uB4DC\uB77C\uC778\uC73C\uB85C \uC0BC\uC744 \uC218 \uC788\uB294 \uACE0\uD488\uC9C8\uC758 \uC804\uBB38 \uAE30\uCD08 \uC9C0\uC2DD(\uD68C\uC0AC \uADDC\uC815, \uD45C\uC900 \uC815\uAD00, \uC0C1\uC138 \uACC4\uC57D\uC11C, \uC2E4\uD589 \uB9E4\uB274\uC5BC, \uBE44\uC988\uB2C8\uC2A4 \uD504\uB808\uC784\uC6CC\uD06C \uB4F1)\uC744 \uC9C1\uC811 \uC124\uACC4\uD558\uACE0 \uC791\uC131\uD574 \uC8FC\uC2ED\uC2DC\uC624.

\uBC18\uB4DC\uC2DC \uC544\uB798 JSON \uC2A4\uD0A4\uB9C8\uB97C \uC900\uC218\uD558\uC5EC \uC751\uB2F5\uD574 \uC8FC\uC2ED\uC2DC\uC624:
{
  "title": "\uC804\uBB38 \uC11C\uC2DD/\uC9C0\uC2DD \uBB38\uC11C\uC758 \uBA54\uC778 \uC81C\uBAA9",
  "content": "\uC870\uD56D \uBC0F \uC138\uBD80 \uAC00\uC774\uB4DC\uAC00 \uD3EC\uD568\uB41C \uC804\uCCB4 \uB9C8\uD06C\uB2E4\uC6B4 \uBCF8\uBB38 \uB0B4\uC6A9"
}`;
  const rawJson = await generateWithFallback(apiKey, {
    prompt,
    temperature: 0.6,
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        content: { type: Type.STRING }
      },
      required: ["title", "content"]
    }
  });
  const parsed = extractJsonFromResponse(rawJson) || JSON.parse(rawJson || "{}");
  return {
    title: parsed.title || `${topic} \uD45C\uC900 \uBE44\uC988\uB2C8\uC2A4 \uC591\uC2DD \uBC0F \uAC00\uC774\uB4DC\uB77C\uC778`,
    content: parsed.content || rawJson
  };
}
async function recommendKnowledgeTopics(apiKey, category = "all", keywords = "", mode = "knowledge") {
  const prompt = `\uB2F9\uC2E0\uC740 \uAE30\uC5C5 \uC804\uB7B5 \uCEE8\uC124\uD305 \uBC0F \uB85C\uD38C \uC218\uC11D \uD30C\uD2B8\uB108\uC785\uB2C8\uB2E4.
\uAE30\uC5C5\uB4E4\uC774 \uC0AC\uB0B4 \uC9C0\uC2DD\uD5C8\uBE0C\uC5D0 \uAD6C\uBE44\uD574\uC57C \uD560 \uAC00\uC7A5 \uC804\uBB38\uC801\uC774\uACE0 \uC2E4\uBB34 \uD65C\uC6A9\uB3C4 \uB192\uC740 \uC9C0\uC2DD/\uC11C\uC2DD/\uD329\uD2B8 \uC8FC\uC81C 6~8\uAC1C\uB97C \uCD94\uCC9C\uD574 \uC8FC\uC2ED\uC2DC\uC624.
\uCE74\uD14C\uACE0\uB9AC: ${category}, \uBAA8\uB4DC: ${mode === "fact" ? "\uCD5C\uC2E0 \uC2DC\uC7A5 \uD2B8\uB80C\uB4DC/\uD1B5\uACC4 \uD329\uD2B8" : "\uC804\uBB38 \uD45C\uC900 \uADDC\uC815/\uACC4\uC57D\uC11C/\uC5C5\uBB34 \uB9E4\uB274\uC5BC"}, \uD0A4\uC6CC\uB4DC: ${keywords}

\uBC18\uB4DC\uC2DC \uC544\uB798 JSON \uD3EC\uB9F7\uC744 \uC900\uC218\uD558\uC5EC JSON \uBB38\uC790\uC5F4\uB9CC \uBC18\uD658\uD574 \uC8FC\uC2ED\uC2DC\uC624:
{
  "topics": [
    {
      "topic": "\uAD6C\uCCB4\uC801\uC778 \uC8FC\uC81C\uBA85",
      "category": "corporate | legal | trend | marketing | other \uC911 \uD558\uB098",
      "categoryName": "\uCE74\uD14C\uACE0\uB9AC \uD55C\uAE00\uBA85",
      "description": "\uC911\uC694\uC131 1\uC904 \uC124\uBA85",
      "tag": "#\uD575\uC2EC\uD0DC\uADF8",
      "badge": "\uCD94\uCC9C | \uD544\uC218 | \uC778\uAE30 | \uCD5C\uC2E0 \uC911 \uD558\uB098"
    }
  ]
}`;
  const rawJson = await generateWithFallback(apiKey, {
    prompt,
    temperature: 0.7
  });
  const parsed = extractJsonFromResponse(rawJson);
  return Array.isArray(parsed?.topics) ? parsed.topics : [];
}
async function chatKnowledge(apiKey, message, history = [], contextDocs = []) {
  let contextText = "";
  if (contextDocs.length > 0) {
    contextText = "\uC0AC\uC6A9\uC790\uC758 \uC9C0\uC2DD\uD5C8\uBE0C\uC5D0\uC11C \uAC80\uC0C9\uB41C \uAD00\uB828 \uBB38\uC11C \uC790\uB8CC\uB4E4:\n\n" + contextDocs.map(
      (doc, idx) => `[\uC790\uB8CC ${idx + 1}] \uC81C\uBAA9: ${doc.title}
\uAD6C\uBD84: ${doc.type === "fact" ? "\uB274\uC2A4 \uD329\uD2B8" : "\uAE30\uCD08 \uC9C0\uC2DD"}
\uB0B4\uC6A9:
${doc.content}`
    ).join("\n\n---\n\n");
  } else {
    contextText = "\uD604\uC7AC \uC9C0\uC2DD\uD5C8\uBE0C\uC5D0 \uD574\uB2F9 \uC9C8\uBB38\uACFC \uBC00\uC811\uD55C \uD329\uD2B8/\uC9C0\uC2DD\uC774 \uBD80\uC7AC\uD558\uC5EC, \uC77C\uBC18 \uBE44\uC988\uB2C8\uC2A4 \uC9C0\uC2DD\uC73C\uB85C \uB2F5\uBCC0\uD569\uB2C8\uB2E4.";
  }
  const systemInstruction = `\uB2F9\uC2E0\uC740 \uCD5C\uACE0 \uC218\uC900\uC758 \uAE30\uC5C5 \uAE30\uD68D\uC2E4 \uC218\uC11D \uC5D0\uC774\uC804\uD2B8 '\uB9C8\uC77C\uB85C(Milo)'\uC785\uB2C8\uB2E4.
\uC0AC\uC6A9\uC790\uAC00 \uC790\uC2E0\uC758 '\uC9C0\uC2DD\uD5C8\uBE0C'\uC5D0 \uBCF4\uAD00\uD574 \uB454 \uCD5C\uC2E0 \uB274\uC2A4 \uD329\uD2B8 \uC790\uB8CC\uC640 \uD45C\uC900 \uC5C5\uBB34 \uC9C0\uC2DD\uC744 \uC18C\uC2A4(RAG)\uB85C \uD65C\uC6A9\uD558\uC5EC \uC804\uBB38\uC801\uC778 \uCEE8\uC124\uD305\uC744 \uC81C\uACF5\uD574\uC57C \uD569\uB2C8\uB2E4.
${contextText}`;
  const contents = [
    ...history.map((h) => ({
      role: h.role,
      parts: [{ text: h.content }]
    })),
    { role: "user", parts: [{ text: message }] }
  ];
  const ai = createGenAIClient(apiKey);
  const response = await ai.models.generateContent({
    model: PRIMARY_TEXT_MODEL,
    contents,
    config: {
      systemInstruction
    }
  });
  return response.text || "";
}
async function auditMarketItem(apiKey, item) {
  let contentSample = "";
  if (item.contentData) {
    try {
      const rawStr = JSON.stringify(item.contentData);
      contentSample = rawStr.length > 2500 ? rawStr.slice(0, 2500) + "..." : rawStr;
    } catch {
      contentSample = "\uBCF8\uBB38 \uB370\uC774\uD130 \uBD84\uC11D \uC644\uB8CC";
    }
  }
  const prompt = `\uB2F9\uC2E0\uC740 \uBE44\uC988\uB2C8\uC2A4 \uBB38\uC11C/\uACC4\uC57D\uC11C/\uC7AC\uBB34\uBAA8\uB378 \uC804\uBB38 \uAC10\uC218 \uC218\uC11D \uC2EC\uC0AC\uC704\uC6D0(AI Quality Auditor)\uC785\uB2C8\uB2E4.
\uC544\uB798 \uBB38\uC11C\uC758 \uC644\uC131\uB3C4, \uC2E4\uBB34 \uD65C\uC6A9\uB3C4, \uADDC\uC815 \uC900\uC218, \uC815\uBC00\uB3C4\uB97C \uC815\uBC00 \uD3C9\uAC00\uD558\uC5EC JSON\uC73C\uB85C \uC751\uB2F5\uD558\uC2ED\uC2DC\uC624.
- \uBB38\uC11C\uBA85: ${item.title}
- \uBD80\uC81C\uBAA9: ${item.subtitle || "\uC5C6\uC74C"}
- \uD3EC\uB9F7: ${item.productType}
- \uCE74\uD14C\uACE0\uB9AC: ${item.category}
- \uC0D8\uD50C:
${contentSample}

JSON \uD3EC\uB9F7:
{
  "overallScore": 94,
  "status": "master_verified",
  "categoryScores": { "structure": 96, "usability": 95, "compliance": 92, "accuracy": 94 },
  "summary": "1\uC904 \uCD1D\uD3C9",
  "strengths": ["\uAC15\uC8101", "\uAC15\uC8102"],
  "improvements": ["\uAC1C\uC120\uC8101"]
}`;
  const rawJson = await generateWithFallback(apiKey, {
    prompt,
    temperature: 0.6
  });
  const parsed = extractJsonFromResponse(rawJson) || {};
  const score = typeof parsed.overallScore === "number" ? Math.min(100, Math.max(50, parsed.overallScore)) : 92;
  const status = parsed.status || (score >= 95 ? "master_verified" : score >= 80 ? "verified" : "needs_review");
  return {
    itemId: item.id,
    score,
    status,
    report: {
      summary: parsed.summary || "AI \uC804\uBB38 \uAC10\uC218 \uAE30\uC900\uC744 \uCDA9\uC871\uD55C \uC2E4\uBB34 \uD45C\uC900 \uC11C\uC2DD\uC785\uB2C8\uB2E4.",
      strengths: Array.isArray(parsed.strengths) && parsed.strengths.length > 0 ? parsed.strengths : ["\uCCB4\uACC4\uC801\uC778 \uBE44\uC988\uB2C8\uC2A4 \uAD6C\uC870 \uC644\uBE44"],
      improvements: Array.isArray(parsed.improvements) && parsed.improvements.length > 0 ? parsed.improvements : ["\uC0AC\uC6A9 \uAE30\uC5C5 \uD658\uACBD\uC5D0 \uB9DE\uCD98 \uC138\uBD80 \uC218\uCE58 \uC870\uC728 \uAD8C\uC7A5"],
      categoryScores: parsed.categoryScores || { structure: score + 1, usability: score, compliance: score - 1, accuracy: score },
      auditedAt: Date.now()
    },
    auditedAt: Date.now()
  };
}
async function generateHelpContent(apiKey, type, topic, category = "\uC77C\uBC18", detail = "") {
  const typeLabels = {
    announcement: "\uACF5\uC9C0\uC0AC\uD56D (Announcement)",
    faq: "\uC790\uC8FC\uD558\uB294 \uC9C8\uBB38 (FAQ)",
    manual: "\uC0AC\uC6A9 \uAC00\uC774\uB4DC\uB77C\uC778/\uB9E4\uB274\uC5BC (Manual)"
  };
  const targetTypeLabel = typeLabels[type] || type;
  const systemInstruction = `\uB2F9\uC2E0\uC740 \uCD5C\uACE0 \uC218\uC900\uC758 IT \uC11C\uBE44\uC2A4 \uD14C\uD06C\uB2C8\uCEEC \uB77C\uC774\uD130\uC785\uB2C8\uB2E4. \uC0AC\uC6A9\uC790\uAC00 \uC694\uCCAD\uD55C \uB3C4\uC6C0\uB9D0 \uCF58\uD150\uCE20(${targetTypeLabel})\uB97C \uCE5C\uC808\uD558\uACE0 \uC815\uBC00\uD55C \uD55C\uAD6D\uC5B4\uB85C \uC791\uC131\uD558\uC2ED\uC2DC\uC624.`;
  const prompt = `[\uB3C4\uC6C0\uB9D0 \uC0DD\uC131 \uC694\uCCAD]
- \uBB38\uC11C \uAD6C\uBD84: ${targetTypeLabel}
- \uBD84\uB958: ${category}
- \uC8FC\uC81C: ${topic}
- \uC138\uBD80\uC0AC\uD56D: ${detail || "\uBA85\uD655\uD558\uACE0 \uCE5C\uC808\uD55C \uAC00\uC774\uB4DC \uC81C\uACF5"}`;
  const rawJson = await generateWithFallback(apiKey, {
    systemInstruction,
    prompt,
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        content: { type: Type.STRING },
        category: { type: Type.STRING }
      },
      required: ["title", "content", "category"]
    }
  });
  const parsed = extractJsonFromResponse(rawJson) || JSON.parse(rawJson || "{}");
  return {
    title: parsed.title || topic,
    content: parsed.content || rawJson,
    category: parsed.category || category
  };
}

// src/server/apiHandler.ts
var FIELD_LABELS = {
  management: "\uACBD\uC601 / \uC804\uB7B5",
  marketing: "\uB9C8\uCF00\uD305 / \uBE0C\uB79C\uB4DC",
  advertising: "\uAD11\uACE0 / \uD64D\uBCF4 (PR)",
  sales: "\uC601\uC5C5 / B2B",
  planning: "\uAE30\uD68D / \uC2E0\uC0AC\uC5C5",
  it_tech: "IT / \uC18C\uD504\uD2B8\uC6E8\uC5B4",
  ai_data: "\uC778\uACF5\uC9C0\uB2A5 / \uB370\uC774\uD130",
  finance: "\uAE08\uC735 / \uD22C\uC790",
  real_estate: "\uBD80\uB3D9\uC0B0 / \uACF5\uAC04",
  education_hr: "\uAD50\uC721 / \uC778\uC0AC (HR)",
  legal: "\uBC95\uB960 / \uADDC\uC81C",
  policy: "\uC815\uCC45 / \uACF5\uACF5",
  research: "\uC5F0\uAD6C / \uD559\uC220",
  manufacturing: "\uC81C\uC870 / \uD488\uC9C8",
  logistics: "\uC720\uD1B5 / \uBB3C\uB958",
  custom: "\uB9DE\uCDA4 \uBD84\uC57C"
};
var DOC_TYPE_LABELS = {
  business_plan: "\uC0AC\uC5C5\uACC4\uD68D\uC11C (Business Plan)",
  proposal: "\uC81C\uC548\uC11C / RFP \uC751\uB2F5\uC11C (Proposal)",
  prd_planning: "\uD504\uB85C\uB355\uD2B8 \uAE30\uD68D\uC11C (PRD)",
  market_research: "\uC2DC\uC7A5\uC870\uC0AC \uBC0F \uBD84\uC11D \uBCF4\uACE0\uC11C",
  competitor_analysis: "\uAE30\uC5C5 \uBC0F \uACBD\uC7C1\uC0AC \uBD84\uC11D\uC11C",
  marketing_strategy: "\uB9C8\uCF00\uD305 / \uAD11\uACE0 \uC804\uB7B5\uC11C",
  tech_spec: "\uAE30\uC220 \uC0AC\uC591\uC11C / \uC544\uD0A4\uD14D\uCC98 \uBB38\uC11C",
  executive_report: "\uACBD\uC601 \uBCF4\uACE0\uC11C / \uC5C5\uBB34 \uBD84\uC11D\uC11C",
  curriculum_guide: "\uAD50\uC721 \uC790\uB8CC / \uAC00\uC774\uB4DC\uB77C\uC778",
  policy_proposal: "\uC815\uCC45 \uBC0F \uC81C\uB3C4 \uC81C\uC548\uC11C",
  ir_pitch: "\uD22C\uC790 \uC720\uCE58 IR \uBB38\uC11C",
  custom: "\uB9DE\uCDA4 \uC804\uBB38 \uBB38\uC11C"
};
var LEVEL_LABELS = {
  entry: "\uAE30\uCD08 / \uC785\uBB38\uC790 \uC218\uC900 (\uCE5C\uC808\uD558\uACE0 \uC54C\uAE30 \uC26C\uC6B4 \uC124\uBA85 \uC911\uC2EC)",
  practitioner: "\uC2E4\uBB34\uC790 / \uB2F4\uB2F9\uC790 \uC218\uC900 (\uAD6C\uCCB4\uC801 \uC2E4\uD589 \uD504\uB85C\uC138\uC2A4\uC640 \uAE30\uC220\uC801 \uC138\uBD80\uC0AC\uD56D \uC911\uC2EC)",
  manager: "\uD300\uC7A5 / \uAD00\uB9AC\uC790 \uC218\uC900 (\uC77C\uC815, \uB9AC\uC18C\uC2A4, \uC131\uACFC\uC9C0\uD45C, \uC758\uC0AC\uACB0\uC815 \uD504\uB808\uC784\uC6CC\uD06C \uC911\uC2EC)",
  executive: "\uC784\uC6D0 / C-Level \uC218\uC900 (\uC804\uB7B5\uC801 \uAC00\uCE58, ROI, \uD575\uC2EC \uB9AC\uC2A4\uD06C, \uC758\uC0AC\uACB0\uC815 \uAD8C\uACE0\uC548 \uC911\uC2EC)",
  academic: "\uD559\uC220 / \uC2EC\uCE35 \uC5F0\uAD6C\uC790 \uC218\uC900 (\uC774\uB860\uC801 \uD0C0\uB2F9\uC131, \uC815\uBC00 \uB370\uC774\uD130 \uBD84\uC11D, \uCC38\uACE0 \uBB38\uD5CC \uCCB4\uACC4)"
};
var LENGTH_INSTRUCTIONS = {
  concise: "\uD575\uC2EC \uC694\uC57D\uD615 (3~4\uAC1C \uC8FC\uC694 \uD575\uC2EC \uC139\uC158\uC73C\uB85C \uC555\uCD95\uD558\uC5EC \uBA85\uB8CC\uD558\uAC8C \uAD6C\uC131)",
  standard: "\uD45C\uC900 \uBE44\uC988\uB2C8\uC2A4\uD615 (5~6\uAC1C \uC139\uC158\uC73C\uB85C \uC2E4\uBB34 \uBCF4\uACE0\uC11C\uC5D0 \uAC00\uC7A5 \uC801\uD569\uD55C \uC644\uC131\uB3C4)",
  comprehensive: "\uC0C1\uC138 \uC2EC\uCE35\uD615 (7~9\uAC1C \uC774\uC0C1\uC758 \uC139\uC158\uC73C\uB85C \uCCA0\uC800\uD55C \uBD84\uC11D, \uD45C, \uC9C0\uD45C, \uC2E4\uD589 \uB85C\uB4DC\uB9F5\uAE4C\uC9C0 \uCD1D\uB9DD\uB77C)"
};
function sanitizeSeed(str) {
  return (str || "business_growth").toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_").substring(0, 30);
}
function normalizeSlideItem(rawSlide, idx, mainTopic) {
  const layout = rawSlide.layout || (idx === 0 ? "title" : idx === 1 ? "cards_grid_3" : idx === 2 ? "bullets_split" : "cards_grid_3");
  const slideNum = idx + 1;
  const rawContent = rawSlide.content || {};
  const cleanSeed = sanitizeSeed(rawSlide.imageKeywords || `${mainTopic}_${idx}`);
  const imageUrl = rawSlide.imageUrl || (idx === 0 ? `https://picsum.photos/seed/biz_cover_${cleanSeed}/1200/800` : `https://picsum.photos/seed/biz_slide_${slideNum}_${cleanSeed}/600/400`);
  const content = { ...rawContent };
  if (layout === "cards_grid_3") {
    const cards = Array.isArray(content.cards) && content.cards.length >= 2 ? content.cards : [
      { tag: "\uD575\uC2EC \uACFC\uC81C 01", title: "\uB370\uC774\uD130 \uD1B5\uD569 \uBC0F \uC2E4\uC2DC\uAC04 \uAC00\uC2DC\uC131 \uD655\uBCF4", description: "\uD30C\uD3B8\uD654\uB41C \uC0AC\uC77C\uB85C \uC2DC\uC2A4\uD15C\uC744 \uC5F0\uACC4\uD558\uC5EC \uC804\uC0AC \uC758\uC0AC\uACB0\uC815 \uC18D\uB3C4\uB97C 40% \uC774\uC0C1 \uAC00\uC18D\uD654\uD569\uB2C8\uB2E4." },
      { tag: "\uD575\uC2EC \uACFC\uC81C 02", title: "\uC9C0\uB2A5\uD615 \uC790\uB3D9\uD654 \uC6CC\uD06C\uD50C\uB85C\uC6B0 \uB3C4\uC785", description: "\uBC18\uBCF5\uC801\uC778 \uC218\uC791\uC5C5 \uACF5\uC815\uC744 85% \uC790\uB3D9\uD654\uD558\uC5EC \uC6B4\uC601 \uBE44\uC6A9\uC744 \uC808\uAC10\uD558\uACE0 \uD734\uBA3C \uC5D0\uB7EC\uB97C \uBC29\uC9C0\uD569\uB2C8\uB2E4." },
      { tag: "\uD575\uC2EC \uACFC\uC81C 03", title: "\uACE0\uAC1D \uB9DE\uCDA4\uD615 \uAC00\uCE58 \uC81C\uC548 \uACE0\uB3C4\uD654", description: "\uC815\uBC00 \uB370\uC774\uD130 \uBD84\uC11D\uC744 \uD1B5\uD574 \uACE0\uAC1D \uC720\uC9C0\uC728\uC744 \uADF9\uB300\uD654\uD558\uACE0 \uC0DD\uC560\uAC00\uCE58(LTV)\uB97C \uC99D\uB300\uC2DC\uD0B5\uB2C8\uB2E4." }
    ];
    content.cards = cards.slice(0, 3);
  } else if (layout === "bullets_split") {
    const bullets = Array.isArray(content.bulletPoints) && content.bulletPoints.length >= 2 ? content.bulletPoints : [
      "\uC5D4\uB4DC\uD22C\uC5D4\uB4DC AI \uC608\uCE21 \uC5D4\uC9C4\uC744 \uD1B5\uD55C \uC2E4\uC2DC\uAC04 \uC9C0\uD45C \uBAA8\uB2C8\uD130\uB9C1 \uBC0F \uC120\uC81C\uC801 \uB300\uC751 \uCCB4\uACC4 \uAD6C\uCD95",
      "\uAE30\uC874 \uB808\uAC70\uC2DC \uC778\uD504\uB77C\uC640\uC758 \uBB34\uC911\uB2E8 \uC5F0\uB3D9\uC744 \uC9C0\uC6D0\uD558\uB294 \uD45C\uC900 API \uC778\uD130\uD398\uC774\uC2A4 \uC81C\uACF5",
      "\uC5C5\uBB34 \uC790\uB3D9\uD654 \uBC0F \uCD5C\uC801\uD654\uB97C \uD1B5\uD55C \uC6B4\uC601 \uBE44\uC6A9 30% \uC774\uC0C1 \uC808\uAC10 \uBC0F \uC0DD\uC0B0\uC131 \uC81C\uACE0",
      "\uAE00\uB85C\uBC8C \uBCF4\uC548 \uD45C\uC900 \uC900\uC218\uC640 \uB2E4\uC911 \uC554\uD638\uD654\uB97C \uD1B5\uD55C \uC5D4\uD130\uD504\uB77C\uC774\uC988\uAE09 \uC2E0\uB8B0\uC131 \uD655\uBCF4"
    ];
    content.bulletPoints = bullets;
  }
  return {
    id: rawSlide.id || `slide_${idx}_${Math.random().toString(36).substr(2, 6)}`,
    slideNumber: slideNum,
    layout,
    category: rawSlide.category || (idx === 0 ? "COVER" : `SECTION 0${slideNum}`),
    title: rawSlide.title || `${mainTopic} - \uC2E4\uD589 \uC804\uB7B5 ${slideNum}`,
    subtitle: rawSlide.subtitle || "",
    keyTakeaway: rawSlide.keyTakeaway || (idx === 0 ? "" : "\uCC28\uBCC4\uD654\uB41C \uC804\uB7B5\uACFC \uC2E4\uD589\uB825\uC744 \uBC14\uD0D5\uC73C\uB85C \uBAA9\uD45C\uB97C \uC644\uBCBD\uD788 \uB2EC\uC131\uD569\uB2C8\uB2E4."),
    imageUrl,
    imageKeywords: rawSlide.imageKeywords || mainTopic,
    showImage: true,
    content,
    speakerNotes: rawSlide.speakerNotes || `\uC2AC\uB77C\uC774\uB4DC ${slideNum}\uBC88\uC5D0\uC11C\uB294 ${rawSlide.title || mainTopic}\uC758 \uD575\uC2EC \uB0B4\uC6A9\uC744 \uC804\uB2EC\uD569\uB2C8\uB2E4.`
  };
}
async function handleApiRequest(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  const sendStatus = (code) => {
    res.statusCode = code;
    return res;
  };
  const sendJson = (data) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
  };
  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
  }
  if (!req.body && (req.method === "POST" || req.method === "PUT")) {
    try {
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      const rawText = Buffer.concat(buffers).toString("utf-8");
      req.body = rawText ? JSON.parse(rawText) : {};
    } catch {
      req.body = {};
    }
  }
  let rawUrlPath = (req.url || "").split("?")[0];
  if (rawUrlPath.startsWith("/api/")) {
    rawUrlPath = rawUrlPath.substring(5);
  } else if (rawUrlPath.startsWith("/api")) {
    rawUrlPath = rawUrlPath.substring(4);
  }
  if (rawUrlPath.startsWith("/")) {
    rawUrlPath = rawUrlPath.substring(1);
  }
  let endpoint = rawUrlPath;
  if (!endpoint && req.query?.path) {
    if (Array.isArray(req.query.path)) {
      endpoint = req.query.path.join("/");
    } else {
      endpoint = String(req.query.path);
    }
  }
  if (endpoint.endsWith("/")) {
    endpoint = endpoint.slice(0, -1);
  }
  if (endpoint === "health" || req.url?.includes("/health")) {
    sendStatus(200);
    sendJson({
      status: "ok",
      service: "Domain-Specific Professional Document Generator",
      version: "2.0.0",
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    return;
  }
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    sendStatus(500);
    sendJson({
      error: "GEMINI_API_KEY \uD658\uACBD\uBCC0\uC218\uAC00 \uC124\uC815\uB418\uC9C0 \uC54A\uC558\uC2B5\uB2C8\uB2E4. Vercel Project Settings > Environment Variables\uB97C \uD655\uC778\uD574 \uC8FC\uC138\uC694."
    });
    return;
  }
  try {
    if (endpoint === "generate-document") {
      const {
        field,
        customField,
        documentType,
        customDocumentType,
        topic,
        purpose,
        targetAudience,
        professionalLevel,
        length,
        keywords = [],
        additionalRequirements
      } = req.body || {};
      const fieldName = customField || FIELD_LABELS[field] || field;
      const docTypeName = customDocumentType || DOC_TYPE_LABELS[documentType] || documentType;
      const levelDesc = LEVEL_LABELS[professionalLevel] || professionalLevel;
      const lengthDesc = LENGTH_INSTRUCTIONS[length] || length;
      const keywordsStr = keywords.length > 0 ? keywords.join(", ") : "\uC8FC\uC81C \uAD00\uB828 \uD575\uC2EC \uD0A4\uC6CC\uB4DC";
      const systemInstruction = `\uB2F9\uC2E0\uC740 \uCD5C\uACE0 \uC804\uBB38 \uBE44\uC988\uB2C8\uC2A4 \uCEE8\uC124\uD134\uD2B8\uC785\uB2C8\uB2E4.
\uC0AC\uC6A9\uC790\uAC00 \uC694\uCCAD\uD55C \uBD84\uC57C(${fieldName})\uC640 \uC720\uD615(${docTypeName})\uC5D0 \uD2B9\uD654\uB41C \uCD5C\uACE0 \uC218\uC900\uC758 \uC804\uBB38 \uBB38\uC11C\uB97C \uC791\uC131\uD574\uC57C \uD569\uB2C8\uB2E4.
\uBC18\uB4DC\uC2DC \uAC01 \uC139\uC158\uC5D0 \uD45C(Markdown Table: | \uC5F41 | \uC5F42 |\\n|---|---|\\n| \uAC121 | \uAC122 |), \uC18C\uC81C\uBAA9(###), \uBD88\uB9BF \uD3EC\uC778\uD2B8\uB97C \uCDA9\uC2E4\uD788 \uD3EC\uD568\uD558\uC2ED\uC2DC\uC624.`;
      const prompt = `[\uBB38\uC11C \uC0DD\uC131 \uC694\uCCAD \uC0AC\uD56D]
- \uC801\uC6A9 \uBD84\uC57C: ${fieldName}
- \uBB38\uC11C \uC720\uD615: ${docTypeName}
- \uBB38\uC11C \uC8FC\uC81C: ${topic}
- \uBB38\uC11C \uC791\uC131 \uBAA9\uC801: ${purpose || "\uCCB4\uACC4\uC801\uC778 \uC804\uB7B5 \uBC0F \uC2E4\uD589 \uBC29\uC548 \uC218\uB9BD"}
- \uB300\uC0C1 \uB3C5\uC790: ${targetAudience || "\uC2E4\uBB34\uC9C4 \uBC0F \uC758\uC0AC\uACB0\uC815\uAD8C\uC790"}
- \uC804\uBB38\uC131 \uC218\uC900: ${levelDesc}
- \uBB38\uC11C \uBD84\uB7C9: ${lengthDesc}
- \uD575\uC2EC \uAC15\uC870 \uD0A4\uC6CC\uB4DC: ${keywordsStr}
- \uCD94\uAC00 \uC694\uAD6C\uC0AC\uD56D: ${additionalRequirements || "\uC804\uBB38\uC801\uC774\uACE0 \uC2E4\uC9C8\uC801\uC778 \uBE44\uC988\uB2C8\uC2A4 \uD3EC\uB9F7 \uC900\uC218"}`;
      const generatedJsonText = await generateWithFallback(apiKey, {
        systemInstruction,
        prompt,
        responseSchema: {
          type: Type2.OBJECT,
          properties: {
            title: { type: Type2.STRING },
            subtitle: { type: Type2.STRING },
            executiveSummary: { type: Type2.STRING },
            tableOfContents: {
              type: Type2.ARRAY,
              items: {
                type: Type2.OBJECT,
                properties: {
                  sectionNumber: { type: Type2.STRING },
                  title: { type: Type2.STRING }
                },
                required: ["sectionNumber", "title"]
              }
            },
            sections: {
              type: Type2.ARRAY,
              items: {
                type: Type2.OBJECT,
                properties: {
                  sectionNumber: { type: Type2.STRING },
                  title: { type: Type2.STRING },
                  summaryGuideline: { type: Type2.STRING },
                  content: { type: Type2.STRING }
                },
                required: ["sectionNumber", "title", "content"]
              }
            },
            conclusion: { type: Type2.STRING }
          },
          required: ["title", "executiveSummary", "tableOfContents", "sections"]
        }
      });
      const parsed = extractJsonFromResponse(generatedJsonText) || JSON.parse(generatedJsonText || "{}");
      const now = Date.now();
      const sectionsWithIds = (parsed.sections || []).map((sec, idx) => ({
        id: `sec-${idx + 1}-${Math.random().toString(36).substr(2, 6)}`,
        sectionNumber: sec.sectionNumber || `${idx + 1}.0`,
        title: sec.title || `\uC139\uC158 ${idx + 1}`,
        summaryGuideline: sec.summaryGuideline || "",
        content: sec.content || ""
      }));
      const tocWithIds = (parsed.tableOfContents || sectionsWithIds).map((toc, idx) => {
        const matchedSec = sectionsWithIds[idx];
        return {
          id: matchedSec ? matchedSec.id : `toc-${idx + 1}`,
          sectionNumber: toc.sectionNumber || `${idx + 1}.0`,
          title: toc.title || `\uC139\uC158 ${idx + 1}`
        };
      });
      const fullContent = [
        parsed.title,
        parsed.subtitle,
        parsed.executiveSummary,
        ...sectionsWithIds.map((s) => s.title + " " + s.content),
        parsed.conclusion
      ].filter(Boolean).join("\n\n");
      const wordCount = fullContent.split(/\s+/).filter(Boolean).length;
      const finalDoc = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 7)}`,
        title: parsed.title || topic,
        subtitle: parsed.subtitle || "",
        executiveSummary: parsed.executiveSummary || "",
        field,
        customField,
        documentType,
        customDocumentType,
        purpose,
        targetAudience,
        professionalLevel,
        length,
        keywords,
        tableOfContents: tocWithIds,
        sections: sectionsWithIds,
        conclusion: parsed.conclusion || "",
        metadata: {
          createdAt: now,
          updatedAt: now,
          wordCount,
          charCount: fullContent.length,
          estimatedReadTimeMinutes: Math.max(1, Math.ceil(wordCount / 200)),
          version: 1,
          isStarred: false,
          tags: [fieldName, docTypeName, ...keywords || []].slice(0, 5)
        }
      };
      sendStatus(200);
      sendJson({ success: true, document: finalDoc });
      return;
    }
    if (endpoint === "generate-section") {
      const { docTitle, field, documentType, sectionNumber, sectionTitle, existingContent, instruction, tone } = req.body || {};
      const prompt = `[\uC804\uBB38 \uBB38\uC11C \uAC1C\uBCC4 \uC139\uC158 \uC7AC\uC791\uC131/\uBCF4\uAC15 \uC694\uCCAD]
- \uC804\uCCB4 \uBB38\uC11C \uC81C\uBAA9: ${docTitle}
- \uBB38\uC11C \uBD84\uC57C \uBC0F \uC720\uD615: ${field} / ${documentType}
- \uC139\uC158 \uBC88\uD638 \uBC0F \uC81C\uBAA9: ${sectionNumber} ${sectionTitle}
- \uAE30\uC874 \uB0B4\uC6A9: ${existingContent || "(\uC2E0\uADDC \uC791\uC131)"}
- \uAC1C\uC120 \uC694\uAD6C\uC0AC\uD56D: ${instruction || "\uC0C1\uC138 \uC2E4\uBB34 \uB370\uC774\uD130, \uD45C, \uCCB4\uD06C\uB9AC\uC2A4\uD2B8 \uD3EC\uD568\uD558\uC5EC \uBCF4\uAC15"}
- \uC694\uCCAD \uD1A4\uC564\uB9E4\uB108: ${tone || "\uC804\uBB38\uC801 \uBE44\uC988\uB2C8\uC2A4 \uBB38\uCCB4"}`;
      const newContent = await generateWithFallback(apiKey, { prompt, temperature: 0.7 });
      sendStatus(200);
      sendJson({ success: true, content: newContent });
      return;
    }
    if (endpoint === "agent/chat" || endpoint === "chat") {
      const { messages = [], currentContext } = req.body || {};
      const reply = await chatWithDocumentAgent(apiKey, messages, currentContext);
      sendStatus(200);
      sendJson({ success: true, reply });
      return;
    }
    if (endpoint === "generate-presentation") {
      const { field = "management", presentationType = "ir_pitch", topic = "", purpose = "", targetAudience = "", companyName = "", theme = "dark_navy", slideCountPreference = 10, keyPoints = "" } = req.body || {};
      const count = Number(slideCountPreference) || 10;
      const deckData = await generatePresentationDeck(apiKey, {
        field: FIELD_LABELS[field] || field,
        presentationType,
        topic,
        purpose,
        targetAudience,
        companyName,
        theme,
        slideCountPreference: count,
        keyPoints
      });
      const rawSlides = deckData.slides || [];
      const normalizedSlides = rawSlides.map((s, idx) => normalizeSlideItem(s, idx, topic));
      const presentationDoc = {
        id: "pres_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
        title: deckData.title || topic,
        subtitle: deckData.subtitle || purpose,
        company: companyName || deckData.company || "\uC804\uB7B5 \uCEE8\uC124\uD305 \uADF8\uB8F9",
        field,
        presentationType,
        targetAudience,
        theme,
        slides: normalizedSlides,
        metadata: { createdAt: Date.now(), updatedAt: Date.now(), slideCount: normalizedSlides.length }
      };
      sendStatus(200);
      sendJson({ success: true, presentation: presentationDoc });
      return;
    }
    if (endpoint === "regenerate-slide") {
      const { presentationTitle, slide, requestedLayout, customPrompt } = req.body || {};
      const updatedSlideData = await regenerateSingleSlide(apiKey, {
        presentationTitle: presentationTitle || "",
        slide,
        requestedLayout,
        customPrompt
      });
      const normalized = normalizeSlideItem({ ...slide, ...updatedSlideData }, (slide.slideNumber || 1) - 1, presentationTitle || "\uBE44\uC988\uB2C8\uC2A4 \uC804\uB7B5");
      sendStatus(200);
      sendJson({ success: true, slide: normalized });
      return;
    }
    if (endpoint === "document-to-presentation") {
      const { document, theme = "dark_navy" } = req.body || {};
      const sectionsSummary = (document.sections || []).map((sec) => `[${sec.sectionNumber}. ${sec.title}]
${sec.content?.substring(0, 400)}...`).join("\n\n");
      const deckData = await convertDocToPresentation(apiKey, {
        documentTitle: document.title,
        executiveSummary: document.executiveSummary || document.title,
        sectionsSummary,
        field: document.field || "management",
        theme
      });
      const rawSlides = deckData.slides || [];
      const normalizedSlides = rawSlides.map((s, idx) => normalizeSlideItem(s, idx, document.title));
      const presentationDoc = {
        id: "pres_conv_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
        title: deckData.title || document.title,
        subtitle: deckData.subtitle || document.executiveSummary?.substring(0, 80) || "",
        company: document.company || "\uC804\uB7B5 \uAE30\uD68D\uC2E4",
        field: document.field || "management",
        presentationType: "business_plan",
        targetAudience: document.targetAudience || "\uACBD\uC601\uC9C4 \uBC0F \uD22C\uC790\uC790",
        theme,
        slides: normalizedSlides,
        metadata: { createdAt: Date.now(), updatedAt: Date.now(), slideCount: normalizedSlides.length }
      };
      sendStatus(200);
      sendJson({ success: true, presentation: presentationDoc });
      return;
    }
    if (endpoint === "generate-excel") {
      const { templateType = "monthly_sales_report", title = "", companyName = "", period = "2026\uB144 1\uC6D4 ~ 12\uC6D4", currency = "KRW", businessDescription = "", keyMetricsToInclude = "" } = req.body || {};
      const rawExcelData = await generateExcelSpreadsheet(apiKey, { templateType, title, companyName, period, currency, businessDescription, keyMetricsToInclude });
      const excelDoc = {
        id: "excel_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
        title: rawExcelData.title || title,
        subtitle: rawExcelData.subtitle || `${period} \uC2E4\uBB34 \uC2A4\uD504\uB808\uB4DC\uC2DC\uD2B8 \uBAA8\uB378`,
        company: companyName || rawExcelData.company || "\uC804\uB7B5 \uAE30\uD68D \uCD1D\uAD04\uD300",
        templateType,
        currency,
        period,
        executiveSummary: rawExcelData.executiveSummary || "",
        kpis: Array.isArray(rawExcelData.kpis) ? rawExcelData.kpis : [],
        sheets: Array.isArray(rawExcelData.sheets) ? rawExcelData.sheets : [],
        chartData: Array.isArray(rawExcelData.chartData) ? rawExcelData.chartData : void 0,
        metadata: { createdAt: Date.now(), updatedAt: Date.now(), sheetCount: rawExcelData.sheets?.length || 1 }
      };
      sendStatus(200);
      sendJson({ success: true, document: excelDoc });
      return;
    }
    if (endpoint === "ai-edit-excel") {
      const { currentDocument, instructionPrompt } = req.body || {};
      const updatedRaw = await aiEditExcelSpreadsheet(apiKey, currentDocument, instructionPrompt);
      const updatedExcelDoc = {
        ...currentDocument,
        title: updatedRaw.title || currentDocument.title,
        subtitle: updatedRaw.subtitle || currentDocument.subtitle,
        company: updatedRaw.company || currentDocument.company,
        executiveSummary: updatedRaw.executiveSummary || currentDocument.executiveSummary,
        kpis: Array.isArray(updatedRaw.kpis) ? updatedRaw.kpis : currentDocument.kpis,
        sheets: Array.isArray(updatedRaw.sheets) ? updatedRaw.sheets : currentDocument.sheets,
        chartData: Array.isArray(updatedRaw.chartData) ? updatedRaw.chartData : currentDocument.chartData,
        chartSuggestion: updatedRaw.chartSuggestion || currentDocument.chartSuggestion,
        metadata: { ...currentDocument.metadata, updatedAt: Date.now(), sheetCount: updatedRaw.sheets?.length || currentDocument.sheets?.length || 1 }
      };
      sendStatus(200);
      sendJson({ success: true, document: updatedExcelDoc });
      return;
    }
    if (endpoint === "generate-form") {
      const { formType, title, drafterName, drafterDepartment, drafterPosition, companyName, recipientName, recipientCompany, keyDetails, totalBudget, targetDate } = req.body || {};
      const generatedRaw = await generateBusinessForm(apiKey, {
        formType: formType || "proposal_approval",
        title: title || "\uACF5\uBB38\uC11C",
        drafterName: drafterName || "\uD64D\uAE38\uB3D9",
        drafterDepartment,
        drafterPosition,
        companyName,
        recipientName,
        recipientCompany,
        keyDetails: keyDetails || "",
        totalBudget,
        targetDate
      });
      const formDocument = {
        id: "form_" + Date.now(),
        formType: formType || "proposal_approval",
        title: generatedRaw.title || title,
        docNumber: generatedRaw.docNumber || `DOC-${(/* @__PURE__ */ new Date()).getFullYear()}-${Math.floor(1e3 + Math.random() * 9e3)}`,
        draftDate: generatedRaw.draftDate || `${(/* @__PURE__ */ new Date()).getFullYear()}\uB144 ${String((/* @__PURE__ */ new Date()).getMonth() + 1).padStart(2, "0")}\uC6D4 ${String((/* @__PURE__ */ new Date()).getDate()).padStart(2, "0")}\uC77C`,
        effectiveDate: generatedRaw.effectiveDate,
        drafter: generatedRaw.drafter || { name: drafterName || "\uD64D\uAE38\uB3D9", department: drafterDepartment || "\uAE30\uD68D\uD300", position: drafterPosition || "\uB2F4\uB2F9\uC790" },
        recipient: generatedRaw.recipient,
        supplier: generatedRaw.supplier,
        approvalLine: generatedRaw.approvalLine || [
          { role: "\uAE30\uC548\uC790", name: drafterName || "\uD64D\uAE38\uB3D9", status: "approved", signature: "\uC2B9\uC778" },
          { role: "\uD300\uC7A5", name: "\uD300\uC7A5", status: "approved", signature: "\uC2B9\uC778" },
          { role: "\uBCF8\uBD80\uC7A5", name: "\uBCF8\uBD80\uC7A5", status: "pending" },
          { role: "\uB300\uD45C\uC774\uC0AC", name: "\uB300\uD45C\uC774\uC0AC", status: "pending" }
        ],
        totalAmountText: generatedRaw.totalAmountText,
        totalAmountNumber: generatedRaw.totalAmountNumber,
        supplyAmount: generatedRaw.supplyAmount,
        taxAmount: generatedRaw.taxAmount,
        sections: generatedRaw.sections || [],
        specialTerms: generatedRaw.specialTerms || [],
        metadata: { createdAt: Date.now(), updatedAt: Date.now() }
      };
      sendStatus(200);
      sendJson({ success: true, document: formDocument });
      return;
    }
    if (endpoint === "ai-edit-form") {
      const { currentDocument, instruction } = req.body || {};
      const updatedRaw = await aiEditBusinessForm(apiKey, currentDocument, instruction);
      const updatedFormDoc = {
        ...currentDocument,
        title: updatedRaw.title || currentDocument.title,
        docNumber: updatedRaw.docNumber || currentDocument.docNumber,
        draftDate: updatedRaw.draftDate || currentDocument.draftDate,
        effectiveDate: updatedRaw.effectiveDate || currentDocument.effectiveDate,
        drafter: updatedRaw.drafter || currentDocument.drafter,
        recipient: updatedRaw.recipient || currentDocument.recipient,
        supplier: updatedRaw.supplier || currentDocument.supplier,
        approvalLine: Array.isArray(updatedRaw.approvalLine) ? updatedRaw.approvalLine : currentDocument.approvalLine,
        totalAmountText: updatedRaw.totalAmountText || currentDocument.totalAmountText,
        totalAmountNumber: updatedRaw.totalAmountNumber !== void 0 ? updatedRaw.totalAmountNumber : currentDocument.totalAmountNumber,
        supplyAmount: updatedRaw.supplyAmount !== void 0 ? updatedRaw.supplyAmount : currentDocument.supplyAmount,
        taxAmount: updatedRaw.taxAmount !== void 0 ? updatedRaw.taxAmount : currentDocument.taxAmount,
        sections: Array.isArray(updatedRaw.sections) ? updatedRaw.sections : currentDocument.sections,
        specialTerms: Array.isArray(updatedRaw.specialTerms) ? updatedRaw.specialTerms : currentDocument.specialTerms,
        metadata: { ...currentDocument.metadata, updatedAt: Date.now() }
      };
      sendStatus(200);
      sendJson({ success: true, document: updatedFormDoc });
      return;
    }
    if (endpoint === "generate-templates") {
      const { existingTitles = [] } = req.body || {};
      const newPresets = await generateRecommendedPresets(apiKey, existingTitles);
      sendStatus(200);
      sendJson({ success: true, templates: newPresets });
      return;
    }
    if (endpoint === "generate-image-asset") {
      const { prompt, aspectRatio = "1:1" } = req.body || {};
      if (!prompt) {
        sendStatus(400);
        sendJson({ error: "\uC774\uBBF8\uC9C0 \uC0DD\uC131 \uD504\uB86C\uD504\uD2B8\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4." });
        return;
      }
      const base64 = await generateImageAsset(apiKey, prompt, aspectRatio);
      sendStatus(200);
      sendJson({ success: true, base64 });
      return;
    }
    if (endpoint === "generate-news-fact") {
      const { topic, category = "trend" } = req.body || {};
      if (!topic) {
        sendStatus(400);
        sendJson({ error: "\uAC80\uC0C9 \uC8FC\uC81C\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4." });
        return;
      }
      const item = await generateNewsFact(apiKey, topic, category);
      sendStatus(200);
      sendJson({ success: true, item });
      return;
    }
    if (endpoint === "generate-ai-knowledge") {
      const { topic, category = "corporate" } = req.body || {};
      if (!topic) {
        sendStatus(400);
        sendJson({ error: "\uC9C0\uC2DD \uC0DD\uC131 \uC8FC\uC81C\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4." });
        return;
      }
      const item = await generateAiKnowledge(apiKey, topic, category);
      sendStatus(200);
      sendJson({ success: true, item });
      return;
    }
    if (endpoint === "recommend-knowledge-topics") {
      const { category = "all", keywords = "", mode = "knowledge" } = req.body || {};
      const topics = await recommendKnowledgeTopics(apiKey, category, keywords, mode);
      sendStatus(200);
      sendJson({ success: true, topics });
      return;
    }
    if (endpoint === "chat-knowledge") {
      const { message, history = [], contextDocs = [] } = req.body || {};
      if (!message) {
        sendStatus(400);
        sendJson({ error: "\uC9C8\uBB38 \uBA54\uC2DC\uC9C0\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4." });
        return;
      }
      const reply = await chatKnowledge(apiKey, message, history, contextDocs);
      sendStatus(200);
      sendJson({ success: true, reply });
      return;
    }
    if (endpoint === "audit-market-item") {
      const { item } = req.body || {};
      if (!item || !item.title) {
        sendStatus(400);
        sendJson({ error: "\uAC80\uC218\uD560 \uB9C8\uCF13 \uBB38\uC11C \uB370\uC774\uD130\uAC00 \uD544\uC694\uD569\uB2C8\uB2E4." });
        return;
      }
      const result = await auditMarketItem(apiKey, item);
      sendStatus(200);
      sendJson({ success: true, ...result });
      return;
    }
    if (endpoint === "generate-help-content") {
      const { type, topic, category = "\uC77C\uBC18", detail = "" } = req.body || {};
      if (!type || !topic) {
        sendStatus(400);
        sendJson({ error: "\uB3C4\uC6C0\uB9D0 \uD0C0\uC785(type)\uACFC \uC8FC\uC81C(topic)\uB294 \uD544\uC218 \uC785\uB825 \uD56D\uBAA9\uC785\uB2C8\uB2E4." });
        return;
      }
      const item = await generateHelpContent(apiKey, type, topic, category, detail);
      sendStatus(200);
      sendJson({ success: true, item });
      return;
    }
    sendStatus(404);
    sendJson({ error: `Not Found endpoint: /api/${endpoint}` });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    console.error(`Error handling /api/${endpoint} (status ${statusCode}):`, error.message || error);
    sendStatus(statusCode);
    sendJson({ error: error.message || "\uC11C\uBC84 \uCC98\uB9AC \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." });
  }
}

// src/server/vercelEntry.ts
dotenv.config();
async function handler(req, res) {
  return handleApiRequest(req, res);
}
export {
  handler as default
};
