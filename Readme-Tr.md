# Juncture Server

Juncture Server, React ile Node.js uygulamalarını birbirine bağlayarak Node.js uygulamalarına grafiksel kullanıcı arayüzleri sağlayan bir TypeScript modülüdür. Frontend ve backend arasında sorunsuz iletişim sağlamak için juncture-bridge kütüphanesi ile birlikte çalışır.

## Özellikler

- Express sunucusu ile kolay entegrasyon
- Socket.IO kullanarak gerçek zamanlı iletişim
- TypeScript desteği
- Hem JavaScript hem de TypeScript projelerinde kullanılabilir
- Hem import hem de require sözdizimini destekler
- juncture-bridge aracılığıyla React ile sorunsuz entegrasyon

## Kurulum

```bash
npm install juncture-server
```

React entegrasyonu için, ayrıca juncture-bridge'i de yükleyin:

```bash
npm install juncture-bridge
```

## Temel Kullanım

### Varsayılan Durum ile Sunucuyu Ayarlama

Juncture'ı varsayılan bir durum ve yapılandırma ile başlatabilirsiniz. İşte bir örnek:

```javascript
import Juncture from 'juncture-server';

let varsayilanDurum = {
    sayac: 0,
    mesaj: ""
}

const uygulama = new Juncture(3000, varsayilanDurum);

const bridge = uygulama.bridge;

// Backend (Node.js)

// Basit komut işleyici
bridge.registerHandler('selamla', async (args) => {
  const selamlama = `Merhaba, ${args.isim}!`;
  uygulama.setState({ ...uygulama.getState(), mesaj: selamlama });
  return selamlama;
});

// Akış örneği
bridge.registerHandler('say', async (args) => {
  const { kadarSay } = args;
  for (let i = 1; i <= kadarSay; i++) {
    uygulama.setState({ ...uygulama.getState(), sayac: i });
    bridge.broadcast('sayacGuncelleme', i);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return 'Sayma işlemi tamamlandı!';
});

uygulama.start();
```

Bu kurulum, varsayılan bir durum tanımlamanıza ve bu durumu işleyicilerinizde kullanmanıza olanak tanır. İşleyiciler, durumun nasıl güncellendiğini ve kullanıldığını gösterir.

### Frontend (React)

Önce bir bridge örneği oluşturun:

```javascript
// utils/bridge.js
import ReactBridge from "juncture-bridge";

const bridge = new ReactBridge("http://localhost:3000");
export default bridge;
```

Ardından, bridge'i React bileşenlerinizde kullanın:

```jsx
import React, { useState, useEffect } from 'react';
import bridge from "../utils/bridge";

function App() {
  const [mesaj, setMesaj] = useState('');
  const [sayac, setSayac] = useState(0);

  const selamlamaYap = () => {
    bridge.execute("selamla", { isim: "Dünya" })
      .then(setMesaj)
      .catch(console.error);
  };

  const saymayaBasla = () => {
    bridge.execute("say", { kadarSay: 5 })
      .then(console.log)
      .catch(console.error);
  };

  useEffect(() => {
    bridge.on("sayacGuncelleme", (data) => {
      setSayac(data);
    });

    bridge.on("durumGuncelleme", (yeniDurum) => {
      setMesaj(yeniDurum.mesaj);
      setSayac(yeniDurum.sayac);
    });

    return () => {
      bridge.off("sayacGuncelleme");
      bridge.off("durumGuncelleme");
    };
  }, []);

  return (
    <div>
      <button onClick={selamlamaYap}>Selamla</button>
      <p>{mesaj}</p>
      <button onClick={saymayaBasla}>Saymaya Başla</button>
      <p>Şu anki sayı: {sayac}</p>
    </div>
  );
}

export default App;
```

## API

### `Juncture`

#### Yapıcı

```typescript
new Juncture(port?: number, defaultState?: any, config?: Partial<JunctureConfig>)
```

- `port`: Sunucunun çalışacağı port (varsayılan: 3000)
- `defaultState`: Başlangıç durumu (varsayılan: {})
- `config`: Yapılandırma seçenekleri

#### Metodlar

- `start()`: Sunucuyu başlatır
- `setState(newState: any)`: Durumu günceller
- `getState()`: Mevcut durumu döndürür

### `ExpressBridge`

#### Metodlar

- `registerHandler(command: string, handler: (args: any) => Promise<any>)`: Yeni bir komut işleyicisi kaydeder
- `broadcast(event: string, data: any)`: Tüm bağlı istemcilere bir olay yayınlar

### `ReactBridge` (juncture-bridge'den)

#### Yapıcı

```typescript
new ReactBridge(url: string)
```

- `url`: Juncture sunucusunun URL'si

#### Metodlar

- `execute(command: string, args: any): Promise<any>`: Sunucuda bir komut çalıştırır
- `on(event: string, callback: (data: any) => void)`: Bir olayı dinler
- `off(event: string)`: Bir olayı dinlemeyi durdurur

## Lisans

MIT