# Speech Provider Comparison

Status: **research only**. No integration was built and no paid API request was sent. All facts come from the providers' public documentation and price pages, **retrieved 2026-11-14**. Providers change these pages often, so every row must be re-checked on the day a contract or integration starts.

**Legend**
- **[F]**: stated on an official provider page (source in §7).
- **[V]**: a number the provider reports about its own product (benchmark, latency, accuracy). It is not independently verified and may not hold for Bandly's audio.
- **UNVERIFIED**: not found in official documentation, or the documentation is ambiguous. It must not be relied on or advertised until it is tested.
- **n/a**: does not apply.

Official language support **does not prove real-world accuracy**. Only the benchmark in `VOICE_BENCHMARK_PLAN.md` can show that.

## 1. Speech-to-text (STT)

| | **Google Cloud STT — Chirp 3** | **Azure AI Speech — real-time STT** | **ElevenLabs Scribe v3 / v3 Live** | **OpenAI transcription** |
|---|---|---|---|---|
| Exact model id | `chirp_3` (STT API **V2** only) [F] | base model by locale (`uz-UZ`, `en-US`, `en-GB`); separate MAI-Transcribe and LLM Speech models [F] | `scribe_v3` (files), `scribe_v3_live` (real-time WebSocket) [F] | `gpt-transcribe` (files), `gpt-live-transcribe` and `gpt-realtime-whisper` (real-time) [F] |
| **Uzbek** | `uz-UZ`, **Preview** launch stage [F]. The locations table lists `uz-UZ` with `chirp_3` only in the **eu** location [F]. | `uz-UZ` "Uzbek (Latin, Uzbekistan)": real-time ✅, batch ✅, fast transcription ✅, monolingual post-stream refinement ✅; multilingual refinement ✗, LLM Speech ✗, MAI-Transcribe ✗; custom speech = plain text only [F] | "Uzbek (uzb)" listed. The provider's own Scribe v2 tier puts it in **"Good (>10% to ≤20% WER)"** on FLEURS, computed per clip [V]. No published Scribe v3 figure for Uzbek. | Not in the language list the docs say "performs well" (the Whisper list shown in the TTS guide). `languages: ["uz"]` acceptance for `gpt-transcribe` is **UNVERIFIED**. |
| English | `en-US`, `en-GB`, `en-IN`, `en-AU`: GA [F] | many `en-*` locales [F] | listed; "Excellent (≤5% WER)" tier [V] | supported [F] |
| Kazakh / Kyrgyz / Russian (later markets) | kk-KZ, ky-KG Preview; ru-RU GA [F] | see Azure table (not re-checked here: out of scope) | kk "High accuracy", ky "Good", ru "Excellent" [V] | kk, ru in the "performs well" list [F]; ky UNVERIFIED |
| Streaming | `StreamingRecognize` ✅ [F] | ✅ Speech SDK / WebSocket [F] | `scribe_v3_live` WebSocket `wss://api.elevenlabs.io/v1/speech-to-text/realtime` [F] | Realtime transcription sessions (`/v1/realtime/transcription_sessions`) [F] |
| Turn / end-of-speech control | `endpointing_sensitivity` STANDARD / SHORT / SUPERSHORT; SHORT may cut the user off [F] | silence timeouts (SDK) — exact names UNVERIFIED here | `commit_strategy=turn_prediction` (model predicts end of turn), VAD or manual commit [F]. The official SDKs do **not** support turn prediction or multilingual mode yet; the raw WebSocket is needed [F]. | `gpt-live-transcribe` and `gpt-realtime-whisper` need turn detection off and a manual `input_audio_buffer.commit` [F] |
| Word timestamps | **Ambiguous**: "word-level timestamps" is listed under *features Chirp 3 doesn't support*, while the row text says they can be enabled in Recognize/BatchRecognize with "some transcription degradation". Streaming gives utterance-level timestamps only [F]. Treat word timestamps as **UNVERIFIED**. | word-level offsets and durations in detailed output [F] (pronunciation assessment returns them per word and phoneme) | word-level or character-level timestamps ✅ (v3 and v3 Live) [F] | only on the deprecated `whisper-1` model, available until **2027-02-26** [F]; none on `gpt-transcribe` [F] |
| Code-switching (Uzbek + English in one sentence) | `language_codes=["auto"]` picks the **dominant** language. A restricted list such as `["uz-UZ","en-US"]` focuses on expected locales [F]. Mid-sentence switching is **not claimed** → UNVERIFIED. | Language identification exists. **Multilingual post-stream refinement is not available for uz-UZ** [F]. Mid-sentence switching → UNVERIFIED. | v3: `secondary_language_codes` for mixed-language audio [F]. v3 Live: `multilang_mode=true` transcribes "each language … in its own script, including switches in the middle of a sentence" [F]. Quality for uz+en is UNVERIFIED. | `languages: [...]` list of expected input languages [F]; quality for uz+en UNVERIFIED |
| Domain terms / proper nouns | model adaptation, up to **1,000 phrases** (fewer recommended) [F] | phrase lists / custom speech (uz-UZ plain text only) [F] | keyterms: up to 1,000 (v3); v3 Live 50 standard + 10,000-term library [F] | `prompt`, `keywords` [F] |
| Noise | built-in denoiser; **cannot remove background human voices** [F] | general noise robustness claimed; no separate denoiser documented here | "background audio filtering" (v3 Live) [F] | v2.1 realtime claims better silence and noise handling [F] |
| Confidence | word-level confidence "isn't truly a confidence score" [F] | confidence in detailed output [F] | UNVERIFIED | UNVERIFIED |
| Regions | `us`, `eu` multi-region (GA) [F]; Uzbek only listed for `eu` [F] | data processed and stored in the resource's region [F]; many regions | US by default; EU, India, Singapore **data residency = Enterprise only** [F] | US and Europe (EEA + Switzerland) for transcription endpoints [F] |
| Data retention | audio and transcripts **not logged by default**; opt-in "data logging" programme gives a discount [F] | real-time STT: "processed only on Azure's server memory, and no data is stored at rest" [F] | data **retained by default** per privacy policy. Zero Retention Mode (`enable_logging=false`) is **Enterprise only** [F]. | `/v1/audio/transcriptions`: no abuse-monitoring retention, no application state, not used for training [F] |
| Price (list, USD) | V2 standard recognition **$0.016/min** for the first 500k min/month (≈ $0.96/h), lower in higher tiers. Dynamic batch $0.003/min [F]. Whether `chirp_3` bills under "standard" is **UNVERIFIED**: the footnote names `chirp`, not `chirp_3`. | real-time **$1.00/audio hour**, fast $0.36/h, batch $0.18/h; free tier 5 h/month [F] | Scribe v3 **$0.20/h**, Scribe v3 Live **$0.22/h** [F] | `gpt-transcribe` $0.0045/min, `gpt-live-transcribe` $0.017/min [F] |
| Known limitations | Uzbek is Preview, so quality or terms can change. Streaming has no word timestamps. Diarization works in batch only. | uz-UZ has no LLM/MAI models and no multilingual refinement. | Data residency and zero retention are Enterprise only. The SDK lags the WebSocket features. | Uzbek is not in the listed languages; there are no word timestamps on current models. |

## 2. English text-to-speech (reference voice and tutor voice)

| | **ElevenLabs** | **Google Chirp 3 HD** | **Azure Neural HD** | **OpenAI** |
|---|---|---|---|---|
| Exact ids | `eleven_v4` (Text to Dialogue API), `eleven_v4_turbo` (Text to Dialogue WebSocket), `eleven_v3`, `eleven_v3_conversational`, `eleven_multilingual_v2`, `eleven_flash_v2_5` [F]. Voices come from a voice library, chosen by `voice_id`. | voice names such as `en-US-Chirp3-HD-Charon`, `en-us-Chirp3-HD-Leda` (the docs use both cases), across locales including `en-US` and `en-GB` [F] | `en-US-Ava:DragonHDLatestNeural`, `en-US-Andrew:DragonHDLatestNeural` (and others); `en-GB-Ada:DragonHDLatestNeural`, `en-GB-Ollie:DragonHDLatestNeural`; `en-GB-Ryan` / `en-GB-Sonia:DragonHDLatestNeural` are **preview** [F] | Realtime voices `alloy`, `ash`, `ballad`, `coral`, `echo`, `sage`, `shimmer`, `verse`, `marin`, `cedar` ("for best quality … `marin` or `cedar`") [F]. Speech API: `gpt-4o-mini-tts`, `tts-1`, `tts-1-hd` [F]. |
| US / UK accent control | Set by the chosen voice. A per-request accent parameter is **UNVERIFIED**. | choose an `en-US` or `en-GB` voice [F] | choose an `en-US` or `en-GB` voice. Multilingual voices accept `<lang xml:lang="en-GB">` to set the accent [F]. | `gpt-4o-mini-tts` accepts `instructions` covering **accent**, emotion and intonation [F]. A Realtime accent setting is **UNVERIFIED**; accent drift has to be tested. |
| Emotion / prosody | **Audio tags** in the text, documented examples: `[laughs]`, `[laughs harder]`, `[starts laughing]`, `[sarcastic]`, `[shouting]`, `[whispers]`, `[sighs]`, `[excited]`, `[mischievously]`. v4 "follows audio tags more reliably" but they are "not perfect yet". A tag works best when the voice was trained on that delivery. v4/v3 do not support SSML `<break>`; use tags or ellipses [F]. **Pronunciation:** `eleven_v4` accepts IPA between slashes, e.g. `/skuːl/` [F]. | pace 0.25–2×; `[pause …]` tags in `markup`; SSML `<prosody>` / `<break>` / `<phoneme>` for **synchronous requests only**, not streaming [F] | HD voices "automatically detect emotional cues". Styles and roles exist on some voices [F]; which styles each HD voice supports is UNVERIFIED. | `instructions` on `gpt-4o-mini-tts` [F]; Realtime is steered by its system prompt (UNVERIFIED for fine control) |
| Streaming | ✅ (Turbo / Conversational / Flash) [F] | `StreamingSynthesize` ✅ [F] | ✅ (SDK) [F] | ✅ Realtime audio; Speech API streaming UNVERIFIED here |
| Latency | provider medians: v4 Turbo ~100 ms; v3 Conversational ~165 ms on the models page but ~280 ms on the price page; Flash ~100 ms vs ~75 ms [V]. The two pages disagree, so these numbers must be measured. | not published → measure | not published → measure | not published as TTS latency → measure |
| Price (list) | v4 **$0.08 / 1K chars**; v4 Turbo, v3 Conversational and Flash **$0.04 / 1K** [F] | **$30 / 1M chars**, first 1M chars/month free [F] | Neural HD **$22 / 1M chars**; neural $15 / 1M; free 0.5M chars/month [F] | `gpt-4o-mini-tts` $12 / 1M audio-out tokens, $0.60 / 1M text-in; `tts-1` $15 / 1M chars; `tts-1-hd` $30 / 1M chars [F] |
| Regions | US default; EU / India / Singapore Enterprise only [F] | global, us, eu, asia-southeast1, europe-west2, asia-northeast1 [F] | HD voices available in westeurope, swedencentral, centralindia, eastus (among others); **not** in germanywestcentral or uaenorth [F] | US / EU residency for audio endpoints [F] |
| Disclosure | n/a found | n/a found | n/a found | OpenAI's TTS guide requires a clear disclosure that the voice is **AI-generated** [F]. Bandly will do this for every provider. |

## 3. Uzbek text-to-speech

| | **Azure** | **Google** | **ElevenLabs** | **OpenAI** |
|---|---|---|---|---|
| Voices | `uz-UZ-MadinaNeural` (female), `uz-UZ-SardorNeural` (male), type **Standard** [F] | **none**: `uz-UZ` does not appear in the TTS voice list [F] | `uz` is listed for `eleven_v4`, `eleven_v4_turbo`, `eleven_v3` and `eleven_v3_conversational` [F]. Not available on `multilingual_v2` or `flash_v2_5` [F]. | Uzbek not in the TTS language list [F] |
| Controls | Footnote 3: **phonemes, custom lexicon and visemes aren't supported** for these voices [F]. So there is no way to force how an English term is pronounced inside Uzbek speech. No styles or roles listed [F]. | n/a | audio tags (laughing, sarcasm, shouting, sighs; see §2) and IPA in `/…/` on `eleven_v4` [F]; how well tags work **in Uzbek** is **UNVERIFIED** | n/a |
| Already in Bandly | `server/tts.ts` calls Azure with `uz-UZ-MadinaNeural` when `TTS_KEY` and `TTS_REGION` are set. In production it is **off** (startup log "TTS: none"). | — | — | — |

## 4. Pronunciation assessment

| | **Azure Pronunciation Assessment** | Others |
|---|---|---|
| Locales | **33 locales**, including `en-US` and `en-GB`. **`uz-UZ` is not supported**, which does not matter for Bandly because only English speech is assessed [F]. | No other candidate documents a pronunciation-assessment product. Standalone providers (for example the Speechace or Speechsuper APIs) are **UNVERIFIED**: their official docs have not been read yet, and their hosts are not on the allowed list. |
| Modes | **scripted** (reference text → reading) and **unscripted** (no reference → speaking) [F] | |
| Granularity | full text, word, **syllable (en-US only)**, **phoneme**. Phoneme names in IPA: en-US only; SAPI: en-US, zh-CN [F]. | |
| Scores | AccuracyScore, FluencyScore, CompletenessScore (scripted only), **ProsodyScore**, PronScore. Word ErrorType: Mispronunciation, Omission, Insertion, UnexpectedBreak, MissingBreak, Monotone [F]. | |
| Prosody | "**Prosody assessment is only available in the en-US locale**" [F] | |
| Grammar / vocabulary / topic | "Content assessment" was **retired** from Speech SDK 1.46.0+. Microsoft recommends using an LLM instead [F]. | |
| Limits | Audio over 30 s needs continuous mode, which has no miscue (EnableMiscue) support. No mixed-language assessment, single speaker only, 16 kHz or higher recommended. Unscripted mode uses a different STT model; Microsoft suggests STT first, then scripted assessment, when accuracy matters. Not in the Go SDK [F]. | |
| Validity claim | Pearson correlation with human judges ">0.5" in Microsoft's own evaluation [V] | |
| Price | Billed as speech-to-text ($1.00/h real-time [F]). The price page lists "Pronunciation Assessment (prosody)" as an "enhanced add-on feature", priced in the calculator data at **$0.30 / hour per feature** [F]. How the two charges combine is **UNVERIFIED** until a test invoice. | |

## 5. Realtime AI tutor (speech-to-speech)

| | **OpenAI `gpt-realtime-2.1`** | `gpt-realtime-2.1-mini` | **OpenAI `gpt-live-1`** | **ElevenLabs Realtime v1 Mini / Max** | **Azure Voice Live** |
|---|---|---|---|---|---|
| What it is | speech-to-speech reasoning model with tool use. Improved alphanumeric recognition, silence/noise handling and interruption over v2 [F]. 128k context, 32k max output, configurable reasoning effort [F]. | smaller variant [F] | full-duplex model that listens and speaks at once; reasoning and tools are delegated to a backend [F] | complete agent (STT + turn-taking + LLM + TTS), "OpenAI Realtime-compatible" WebSocket API [F] | Azure realtime voice API combining speech and LLMs [F]; model list and unit prices not analysed here → **UNVERIFIED** |
| Endpoint | `/v1/realtime` (WebRTC, WebSocket, SIP) [F] | same | `/v1/live/sessions` [F] | ElevenAgents / Realtime API [F] | Azure resource |
| Turn-taking / interruption | `server_vad` or `semantic_vad`, `interrupt_response`. Over WebRTC the server truncates unplayed audio on interruption; over WebSocket use `conversation.item.truncate` [F]. | same | "smooth interruption handling" [F] | "natural turn-taking and interruption handling" [F] | UNVERIFIED |
| Voices / accent | 10 built-in voices. The voice cannot change after the first audio in a session [F]. Accent control: **UNVERIFIED**. | same | UNVERIFIED | ElevenLabs voice library [F] | Azure voices, including HD [F] |
| Uzbek | not documented → **UNVERIFIED** (must be benchmarked; see `UZBEK_SPEECH_SUPPORT.md`) | same | UNVERIFIED | 90+ languages, following the v4 list, which includes `uz` [F]; quality UNVERIFIED | depends on the chosen STT/TTS; uz-UZ STT and TTS exist in Azure [F] |
| Browser security | short-lived **ephemeral client secret** from `/v1/realtime/client_secrets`, minted by our server. The standard key never reaches the browser [F]. | same | same pattern [F] | UNVERIFIED | UNVERIFIED |
| Price | audio **$32 / 1M input tokens, $64 / 1M output**, cached $0.40; text $4 / $24 [F]. User audio = 1 token per 100 ms, assistant audio = 1 token per 50 ms [F]. See `VOICE_COST_MODEL.md`. | audio $10 / $20, cached $0.30 [F] | **$0.05 / min** billed per second, plus backend model usage [F]. Creating a WebRTC session bills 15 s up front, credited against the session [F]. | **$0.08 / min + LLM usage** [F] | UNVERIFIED |
| Data | `/v1/realtime`: abuse-monitoring logs up to 30 days, no application state, Zero Data Retention eligible (approval needed), not used for training [F] | same | `/v1/live/sessions`: 30 days; application state none, or 30 days if stored [F] | default retention; ZRM Enterprise only [F] | in-region processing [F]; Voice Live may route HD synthesis to another HD-capable region [F] |
| Residency | US and Europe (EEA + Switzerland) for `/v1/realtime`, including `gpt-realtime-2.1` [F]. Tracing is not EU-residency compliant [F]. | same | UNVERIFIED | Enterprise only [F] | resource region [F] |
| Rate limits | Build tier: 400 RPM, 200k TPM [F] | UNVERIFIED | UNVERIFIED | concurrency by plan [F] | Azure quotas |

## 6. Recommendation (primary / fallback), to be confirmed by the benchmark

Every choice below is a hypothesis until `VOICE_BENCHMARK_PLAN.md` has been run and the acceptance criteria are met. Bandly ships whatever the benchmark shows, not this table.

| Function | Primary (test first) | Fallback | Why |
|---|---|---|---|
| English learner STT (speaking turns) | Azure real-time STT `en-US` / `en-GB` | Google Chirp 3 or ElevenLabs Scribe v3 Live | Azure is already needed for pronunciation assessment, and the docs say no audio is stored at rest. Test against the alternatives on learner audio. |
| Uzbek STT (explanations, code-switching) | **Benchmark-decided** between Google Chirp 3 (Preview, eu), Azure `uz-UZ` and ElevenLabs Scribe v3 / v3 Live | the second best of these | No provider proves real-world Uzbek accuracy. ElevenLabs is the only one that documents mid-sentence switching (`multilang_mode`), so its data terms then become the deciding factor. |
| Reading-mode assessment | **Azure Pronunciation Assessment, scripted**, `en-US` (prosody) or `en-GB` (no prosody) | none equivalent. With no Azure, the feature is off and the UI says so. | The only documented product. Prosody (stress, intonation, pauses) works **only in en-US**, so British-accent learners get accuracy and fluency without a prosody score. |
| Speaking-mode pronunciation | Azure unscripted, or STT then scripted (Microsoft's recommendation) | none | Grammar, vocabulary and relevance come from the LLM layer, not from Azure. |
| English reference voice (Reading mode, cached) | shortlist: Azure HD `en-US-Ava` / `en-US-Andrew` and `en-GB-Ada` / `en-GB-Ollie`; Google Chirp 3 HD en-US / en-GB; ElevenLabs `eleven_v4` | another on the shortlist | Reference audio can be generated once and cached, so price matters less than quality. Native reviewers choose. |
| Realtime tutor (Speaking and AI Teacher modes) | OpenAI `gpt-realtime-2.1` (or `-mini` for cost) | text chat with English TTS (no realtime) | Documented barge-in, VAD, ephemeral keys and EU residency. Compare with `gpt-live-1` and ElevenLabs Realtime in the benchmark. |
| Uzbek TTS | Azure `uz-UZ-MadinaNeural` / `uz-UZ-SardorNeural` (already integrated, off) | ElevenLabs v4 / v3 (Uzbek listed, quality unknown) | Azure has no phoneme or lexicon control, so English terms inside Uzbek must be tested. |

Data-protection note: every provider above processes voice outside Uzbekistan. Whether that is lawful for Uzbek users, and what consent it needs, is the open owner/legal question **OD-01**, extended by OD-22 in this set. Nothing is switched on before that answer.

## 7. Sources (retrieved 2026-11-14)
- Azure language support: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support
- Azure pronunciation assessment how-to: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-pronunciation-assessment
- Azure pronunciation assessment limitations: https://learn.microsoft.com/en-us/azure/ai-foundry/responsible-ai/speech-service/pronunciation-assessment/characteristics-and-limitations-pronunciation-assessment
- Azure STT data and privacy: https://learn.microsoft.com/en-us/azure/ai-foundry/responsible-ai/speech-service/speech-to-text/data-privacy-security
- Azure regions: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/regions
- Azure quotas: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-services-quotas-and-limits
- Azure pricing page and calculator data: https://azure.microsoft.com/en-us/pricing/details/cognitive-services/speech-services/ (prices read from the page's calculator JSON, US East and West Europe identical)
- Google Chirp 3: https://cloud.google.com/speech-to-text/v2/docs/chirp_3-model
- Google STT languages and locations: https://cloud.google.com/speech-to-text/v2/docs/speech-to-text-supported-languages
- Google STT pricing: https://cloud.google.com/speech-to-text/pricing
- Google STT data logging: https://cloud.google.com/speech-to-text/docs/data-logging
- Google Chirp 3 HD: https://cloud.google.com/text-to-speech/docs/chirp3-hd
- Google TTS voices: https://cloud.google.com/text-to-speech/docs/list-voices-and-types
- Google TTS pricing: https://cloud.google.com/text-to-speech/pricing
- ElevenLabs models: https://elevenlabs.io/docs/overview/models
- ElevenLabs speech-to-text: https://elevenlabs.io/docs/overview/capabilities/speech-to-text
- ElevenLabs API pricing: https://elevenlabs.io/pricing/api
- ElevenLabs Zero Retention Mode: https://elevenlabs.io/docs/resources/zero-retention-mode
- ElevenLabs data residency: https://elevenlabs.io/docs/overview/administration/data-residency
- OpenAI models index, `gpt-realtime-2.1`, `gpt-realtime-2.1-mini`, `gpt-live-1`, `gpt-transcribe`: https://developers.openai.com/api/docs/models
- OpenAI pricing: https://developers.openai.com/api/docs/pricing
- OpenAI realtime conversations, VAD, WebRTC, cost guides: https://developers.openai.com/api/docs/guides/realtime-conversations, …/realtime-vad, …/voice-webrtc, …/realtime-costs
- OpenAI speech-to-text and text-to-speech guides: https://developers.openai.com/api/docs/guides/speech-to-text, …/text-to-speech
- OpenAI data controls and residency: https://developers.openai.com/api/docs/guides/your-data, …/data-residency
