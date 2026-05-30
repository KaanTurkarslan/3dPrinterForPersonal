import OpenAI from "openai";

// LM Studio yerel sunucusuna bağlanacak istemciyi oluşturuyoruz
const openai = new OpenAI({
  baseURL: "http://localhost:1234/v1", // LM Studio'nun varsayılan API adresi
  apiKey: "lm-studio", // Yerelde şifre gerekmez ama boş bırakmamak için bunu yazıyoruz
  dangerouslyAllowBrowser: true // Eğer bu kodu doğrudan frontend'de (Client Component) çalıştıracaksan bunu ekle
});

// Kullanıcıdan gelen soruyu veya 3D yazıcı verisini modele gönderen fonksiyon
export async function askQwen(userPrompt) {
  try {
    const response = await openai.chat.completions.create({
      model: "qwen/qwen2.5-vl-7b", // LM Studio'nun önerdiği geçerli model adı
      messages: [
        { 
          role: "system", 
          content: "Sen kullanıcıların kendi 3D yazıcı süreçlerini, baskı kalitelerini ve filament ayarlarını optimize etmelerine yardımcı olan uzman bir 3D baskı asistanısın. YALNIZCA TÜRKÇE YANIT VER (SADECE TÜRKÇE). Kesinlikle Çince karakterler veya başka bir dil kullanma." 
        },
        { 
          role: "user", 
          content: userPrompt 
        }
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("LM Studio bağlantı hatası:", error);
    return "Hata detayı: " + (error.message || error) + " (Klavyeden F12 tuşuna basarak 'Console' sekmesinden hatanın tam detayına bakabilirsiniz)";
  }
}
