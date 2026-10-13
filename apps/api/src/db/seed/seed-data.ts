export interface BrandedBlueprint {
  kind: "branded";
  brand: string;
  model: string;
  variants: string[];
  colors?: string[];
  price: [number, number];
  specs?: Record<string, string>;
}

export interface PlainBlueprint {
  kind: "plain";
  title: string;
  brand?: string;
  price: [number, number];
  specs?: Record<string, string>;
}

export type Blueprint = BrandedBlueprint | PlainBlueprint;

export interface LeafBlueprint {
  name: string;
  slug: string;
  icon: string;
  blueprints: Blueprint[];
}

export interface RootBlueprint {
  name: string;
  slug: string;
  icon: string;
  hue: number;
  leaves: LeafBlueprint[];
}

export function b(
  brand: string,
  model: string,
  variants: string[],
  price: [number, number],
  opts: { colors?: string[]; specs?: Record<string, string> } = {},
): BrandedBlueprint {
  return { kind: "branded", brand, model, variants, price, colors: opts.colors, specs: opts.specs };
}

export function p(title: string, price: [number, number], brand?: string, specs?: Record<string, string>): PlainBlueprint {
  return { kind: "plain", title, price, brand, specs };
}

export const CATALOG: RootBlueprint[] = [
  {
    name: "Celulares y Teléfonos",
    slug: "celulares",
    icon: "📱",
    hue: 205,
    leaves: [
      {
        name: "Smartphones",
        slug: "celulares-smartphones",
        icon: "📱",
        blueprints: [
          b("Samsung", "Galaxy S24 Ultra", ["256gb 12ram", "512gb 12ram"], [980000, 1450000], {
            colors: ["Negro Titanio", "Violeta Titanio", "Gris Titanio"],
            specs: { "Cámara trasera": "200 MP + 50 MP + 12 MP + 10 MP", Pantalla: '6.8" Dynamic AMOLED 2X', "Batería": "5000 mAh", Procesador: "Snapdragon 8 Gen 3" },
          }),
          b("Samsung", "Galaxy A55 5G", ["256gb 8ram"], [520000, 640000], {
            colors: ["Azul Awesome", "Negro Awesome", "Lila Awesome"],
            specs: { "Cámara trasera": "50 MP + 12 MP + 5 MP", Pantalla: '6.6" Super AMOLED', Batería: "5000 mAh" },
          }),
          b("Apple", "iPhone 15 Pro", ["128gb", "256gb"], [1450000, 1780000], {
            colors: ["Titanio Natural", "Titanio Negro", "Titanio Azul"],
            specs: { "Cámara trasera": "48 MP + 12 MP + 12 MP", Pantalla: '6.1" Super Retina XDR', Chip: "A17 Pro", Conector: "USB-C" },
          }),
          b("Apple", "iPhone 14", ["128gb"], [980000, 1150000], {
            colors: ["Medianoche", "Azul", "Blanco Estrella"],
            specs: { "Cámara trasera": "12 MP + 12 MP", Pantalla: '6.1" Super Retina XDR', Chip: "A15 Bionic" },
          }),
          b("Motorola", "Edge 50 Fusion", ["256gb 8ram"], [430000, 560000], {
            colors: ["Azul Marino", "Negro Pantone", "Rosa Marshmallow"],
            specs: { "Cámara trasera": "50 MP + 13 MP", Pantalla: '6.7" pOLED', Batería: "5000 mAh" },
          }),
          b("Xiaomi", "Redmi Note 13 Pro", ["256gb 8ram"], [340000, 440000], {
            colors: ["Negro Medianoche", "Morado Lavanda", "Blanco Polar"],
            specs: { "Cámara trasera": "200 MP + 8 MP + 2 MP", Pantalla: '6.67" AMOLED', Batería: "5100 mAh" },
          }),
        ],
      },
      {
        name: "Accesorios para Celulares",
        slug: "celulares-accesorios",
        icon: "🔌",
        blueprints: [
          p("Soporte Magnético Para Celular Baseus Montaje En Auto", [12000, 22000], "Baseus"),
          p("Anillo Holder Led Aro De Luz Para Selfie Universal", [6500, 14000], "Genérico"),
          p("Batería Portátil Power Bank 20000mah Carga Rápida", [28000, 45000], "Romoss"),
          p("Pop Socket Soporte Expansionable Antiestrés Para Celular", [6000, 11000], "PopSockets"),
          p("Trípode Flexible Para Celular Con Control Bluetooth", [13000, 24000], "Kreator"),
          p("Soporte Celular Para Bicicleta Impermeable Con Gancho", [9000, 16000], "Rockbros"),
        ],
      },
      {
        name: "Fundas y Carcasas",
        slug: "celulares-fundas",
        icon: "🛡️",
        blueprints: [
          p("Funda Silicona Case Para iPhone 15 Pro Max Antigolpe", [8000, 18000], "CaseVault"),
          p("Funda Antigolpe Militar Para Samsung Galaxy S24 Ultra", [9000, 19000], "Spigen"),
          p("Funda Libro Espejo Con Tapa Para Samsung A55", [11000, 21000], "KSIX"),
          p("Funda Transparente Reforzada Para Motorola Edge 50", [7500, 15000], "Nillkin"),
          p("Funda Cartera Con Ranuras Para Tarjetas iPhone 14", [12000, 24000], "TUCCH"),
        ],
      },
      {
        name: "Cargadores y Cables",
        slug: "celulares-cargadores",
        icon: "🔋",
        blueprints: [
          p("Cargador Turbo Original Samsung 25w Con Cable USB-C", [22000, 38000], "Samsung"),
          p("Cargador MagSafe Apple 20w Conexión USB-C", [55000, 78000], "Apple"),
          p("Cable USB-C A USB-C 2 Metros Carga Rápida 100w", [9000, 18000], "Ugreen"),
          p("Cargador Inalámbrico Rápido 15w Baseus Para Auto", [21000, 34000], "Baseus"),
          p("Cargador Triple 65w GaN Con 2 USB-C Y 1 USB-A", [35000, 52000], "Ugreen"),
        ],
      },
    ],
  },
  {
    name: "Computación",
    slug: "computacion",
    icon: "💻",
    hue: 220,
    leaves: [
      {
        name: "Notebooks",
        slug: "computacion-laptops",
        icon: "💻",
        blueprints: [
          b("Lenovo", "IdeaPad 3 15.6", ["Intel Core i3 8gb 256ssd", "Intel Core i5 16gb 512ssd"], [620000, 890000], {
            specs: { Pantalla: '15.6" Full HD', Sistema: "Windows 11 Home", Gráficos: "Intel UHD" },
          }),
          b("Lenovo", "ThinkPad E14 Gen 5", ["Ryzen 5 16gb 512ssd"], [1150000, 1350000], {
            specs: { Pantalla: '14" WUXGA', Sistema: "Windows 11 Pro", Teclado: "Retroiluminado" },
          }),
          b("HP", "Pavilion 15", ["Core i5 8gb 512ssd", "Ryzen 7 16gb 1tb"], [780000, 1120000], {
            specs: { Pantalla: '15.6" Full HD', Sistema: "Windows 11 Home" },
          }),
          b("HP", "Victus 16 Gaming", ["Core i5 Rtx 3050 8gb 512ssd", "Core i7 Rtx 4060 16gb 512ssd"], [1050000, 1680000], {
            specs: { Pantalla: '16.1" 144hz', Gráficos: "NVIDIA GeForce RTX", Sistema: "Windows 11 Home" },
          }),
          b("Dell", "Inspiron 15 3520", ["Core i3 8gb 256ssd"], [660000, 920000], {
            specs: { Pantalla: '15.6" Full HD', Sistema: "Windows 11 Home" },
          }),
          b("ASUS", "TUF Gaming F15", ["Core i5 Rtx 3050 16gb 512ssd"], [980000, 1150000], {
            specs: { Pantalla: '15.6" 144hz', Gráficos: "NVIDIA GeForce RTX 3050" },
          }),
          b("ASUS", "VivoBook 15", ["Ryzen 5 8gb 256ssd"], [720000, 880000], {
            specs: { Pantalla: '15.6" Full HD', Sistema: "Windows 11 Home" },
          }),
          b("Apple", "MacBook Air 13 M2", ["8gb 256ssd"], [1180000, 1380000], {
            colors: ["Medianoche", "Plata", "Gris Espacial"],
            specs: { Chip: "Apple M2", Pantalla: '13.6" Liquid Retina', Batería: "Hasta 18 horas", Sistema: "macOS Sonoma" },
          }),
          b("Apple", "MacBook Pro 14 M3", ["8gb 512ssd"], [2350000, 2750000], {
            colors: ["Gris Espacial", "Plata"],
            specs: { Chip: "Apple M3", Pantalla: '14.2" Liquid Retina XDR', Batería: "Hasta 22 horas" },
          }),
        ],
      },
      {
        name: "Monitores",
        slug: "computacion-monitores",
        icon: "🖥️",
        blueprints: [
          b("Samsung", "Monitor 24 F350", ['24" 75hz Ips'], [210000, 270000], { specs: { Resolución: "1920 x 1080", Panel: "IPS" } }),
          b("LG", "UltraGear 27 165hz", ['27" 165hz Ips 1ms'], [420000, 530000], { specs: { Resolución: "1920 x 1080", Panel: "IPS", Frecuencia: "165 Hz" } }),
          b("Dell", "Monitor 27 S2721DS", ['27" Qhd Ips'], [380000, 460000], { specs: { Resolución: "2560 x 1440", Panel: "IPS" } }),
          b("Samsung", "Odyssey G5 32 Curvo", ['32" 144hz Curvo'], [520000, 650000], { specs: { Resolución: "2560 x 1440", Curvatura: "1000R" } }),
        ],
      },
      {
        name: "Componentes de PC",
        slug: "computacion-componentes",
        icon: "🧩",
        blueprints: [
          p("Placa De Video Nvidia Geforce Rtx 4060 Ti 8gb Gigabyte", [620000, 780000], "Gigabyte"),
          p("Procesador Amd Ryzen 5 5600x 6 Núcleos Socket Am4", [230000, 310000], "AMD"),
          p("Memoria Ram Corsair Vengeance 16gb 3200mhz Ddr4 Rgb", [88000, 125000], "Corsair"),
          p("Motherboard Asus Prime B550m-a Wi-fi Socket Am4", [145000, 195000], "ASUS"),
          p("Fuente De Poder Corsair 750w 80 Plus Gold", [130000, 178000], "Corsair"),
          p("Gabinete Pc Gamer Aerocool Shard Vidrio Templado", [95000, 138000], "Aerocool"),
        ],
      },
      {
        name: "Almacenamiento",
        slug: "computacion-almacenamiento",
        icon: "💾",
        blueprints: [
          p("Disco Sólido Ssd Kingston Nv2 1tb Nvme Pcie 4.0", [95000, 138000], "Kingston"),
          p("Disco Sólido Ssd Crucial Bx500 480gb Sata", [52000, 74000], "Crucial"),
          p("Disco Duro Externo Wd Elements 2tb Usb 3.0", [130000, 168000], "Western Digital"),
          p("Pendrive Sandisk Ultra 128gb Usb 3.2", [13000, 21000], "SanDisk"),
        ],
      },
      {
        name: "Periféricos",
        slug: "computacion-perifericos",
        icon: "⌨️",
        blueprints: [
          p("Teclado Mecánico Redragon Kumara K552 Rgb Español", [58000, 85000], "Redragon"),
          p("Mouse Logitech G203 Lightsync 8000dpi Rgb", [28000, 39000], "Logitech"),
          p("Mousepad Razer Goliathus Extended Chroma Xl", [35000, 49000], "Razer"),
          p("Webcam Logitech C920s Pro Full Hd 1080p", [75000, 99000], "Logitech"),
          p("Combo Teclado Y Mouse Inalámbrico Logitech Mk270", [42000, 59000], "Logitech"),
        ],
      },
    ],
  },
  {
    name: "Electrónica, Audio y Video",
    slug: "electronica",
    icon: "📺",
    hue: 262,
    leaves: [
      {
        name: "Smart TVs",
        slug: "electronica-tv",
        icon: "📺",
        blueprints: [
          b("LG", "Smart TV 4K UHD ThinQ AI", ['55"', '65"'], [640000, 1020000], {
            specs: { Resolución: "4K UHD", Sistema: "webOS", "HDR": "HDR10 Pro" },
          }),
          b("Samsung", "Smart TV Crystal UHD 4K", ['50"', '55"'], [520000, 790000], {
            specs: { Resolución: "4K UHD", Sistema: "Tizen", "HDR": "HDR10+" },
          }),
          b("TCL", "Smart TV QLED 4K Google TV", ['65"'], [720000, 900000], { specs: { Resolución: "4K QLED", Sistema: "Google TV" } }),
          b("Philips", "Smart TV Full HD Android", ['43"'], [340000, 440000], { specs: { Resolución: "Full HD", Sistema: "Android TV" } }),
          b("Noblex", "Smart TV HD Android TV", ['32"'], [260000, 340000], { specs: { Resolución: "HD", Sistema: "Android TV" } }),
        ],
      },
      {
        name: "Auriculares",
        slug: "electronica-auriculares",
        icon: "🎧",
        blueprints: [
          b("Sony", "WH-1000XM5 Bluetooth Noise Cancelling", ["Over-ear"], [480000, 600000], {
            colors: ["Negro", "Plata"],
            specs: { Tipo: "Over-ear", "Cancelación de ruido": "Activa", Autonomía: "30 hs" },
          }),
          b("Apple", "AirPods Pro 2 USB-C", ["2da generación"], [420000, 530000], {
            colors: ["Blanco"],
            specs: { Tipo: "In-ear", "Cancelación de ruido": "Activa", Chip: "H2" },
          }),
          b("JBL", "Tune 760NC Bluetooth", ["On-ear"], [95000, 145000], {
            colors: ["Negro", "Blanco", "Azul"],
            specs: { Tipo: "On-ear", Autonomía: "35 hs", "Cancelación de ruido": "Activa" },
          }),
          b("Bose", "QuietComfort Bluetooth", ["Over-ear"], [620000, 750000], {
            colors: ["Negro", "Blanco Humo"],
            specs: { Tipo: "Over-ear", "Cancelación de ruido": "Activa" },
          }),
          b("Samsung", "Galaxy Buds FE Bluetooth", ["In-ear"], [110000, 165000], {
            colors: ["Blanco", "Negro"],
            specs: { Tipo: "In-ear", "Cancelación de ruido": "Activa", Autonomía: "30 hs" },
          }),
          b("HyperX", "Cloud III Gamer Con Micrófono", ["Over-ear"], [145000, 190000], {
            colors: ["Negro", "Rojo"],
            specs: { Tipo: "Over-ear", Micrófono: "Desmontable con cancelación", Conexión: "USB / 3.5mm" },
          }),
        ],
      },
      {
        name: "Parlantes",
        slug: "electronica-parlantes",
        icon: "🔊",
        blueprints: [
          b("JBL", "Charge 5 Bluetooth Waterproof", ["Portátil"], [230000, 295000], {
            colors: ["Negro", "Azul", "Camuflaje"],
            specs: { Resistencia: "IP67", Autonomía: "20 hs", Potencia: "30 W" },
          }),
          b("JBL", "Flip 6 Bluetooth Portátil", ["Portátil"], [160000, 215000], {
            colors: ["Negro", "Azul", "Rojo"],
            specs: { Resistencia: "IP67", Autonomía: "12 hs", Potencia: "20 W" },
          }),
          b("Bose", "SoundLink Flex Bluetooth", ["Portátil"], [230000, 295000], {
            colors: ["Negro", "Azul", "Blanco"],
            specs: { Resistencia: "IP67", Autonomía: "12 hs" },
          }),
          b("Sony", "SRS-XB23 Extra Bass Bluetooth", ["Portátil"], [130000, 185000], {
            colors: ["Negro", "Azul", "Beige"],
            specs: { Resistencia: "IP67", Autonomía: "12 hs", "Extra Bass": "Sí" },
          }),
          b("Marshall", "Emberton Bluetooth 20hs", ["Portátil"], [290000, 365000], {
            colors: ["Crema", "Negro"],
            specs: { Resistencia: "IPX7", Autonomía: "20 hs", Potencia: "20 W" },
          }),
        ],
      },
      {
        name: "Cámaras",
        slug: "electronica-camaras",
        icon: "📷",
        blueprints: [
          b("Canon", "EOS R50 Mirrorless 24mp 4k", ["Cuerpo + 18-45mm"], [980000, 1200000], {
            specs: { Sensor: "APS-C 24 MP", Video: "4K 30fps", Montura: "RF" },
          }),
          b("Sony", "Alpha A7 III Mirrorless Full Frame", ["Cuerpo"], [1750000, 2150000], {
            specs: { Sensor: "Full Frame 24 MP", Video: "4K", Estabilización: "5 ejes" },
          }),
          b("GoPro", "Hero 12 Black 5.3k Sumergible", ["Cuerpo"], [520000, 660000], {
            specs: { Video: "5.3K", Resistencia: "Sumergible 10m", Estabilización: "HyperSmooth 6.0" },
          }),
          b("Nikon", "Z30 Vlogger 4k", ["Cuerpo + 16-50mm"], [780000, 960000], {
            specs: { Sensor: "APS-C 20.9 MP", Video: "4K 30fps", Pantalla: "Abatible" },
          }),
        ],
      },
      {
        name: "Smartwatches",
        slug: "electronica-smartwatches",
        icon: "⌚",
        blueprints: [
          b("Apple", "Watch Series 9 Gps 45mm", ["45mm"], [620000, 780000], {
            colors: ["Medianoche", "Plata", "Rosa"],
            specs: { Pantalla: "Retina LTPO OLED", Sensores: "ECG, oxígeno, temperatura" },
          }),
          b("Samsung", "Galaxy Watch6 Classic 47mm", ["47mm"], [480000, 620000], {
            colors: ["Negro", "Plateado"],
            specs: { Pantalla: "Super AMOLED", Corona: "Giratoria" },
          }),
          b("Xiaomi", "Smart Band 8 Amoled", ["Standard"], [55000, 78000], {
            colors: ["Negro", "Dorado", "Verde"],
            specs: { Pantalla: "AMOLED 1.62\"", Autonomía: "16 días" },
          }),
          b("Garmin", "Forerunner 165 Gps", ["Standard"], [420000, 520000], {
            colors: ["Negro", "Blanco"],
            specs: { GPS: "Multibanda", Autonomía: "11 días", Deporte: "Running / Triatlón" },
          }),
          b("Amazfit", "GTR 4 Amoled Gps", ["Standard"], [160000, 225000], {
            colors: ["Negro", "Marrón"],
            specs: { Pantalla: "AMOLED 1.43\"", Autonomía: "14 días" },
          }),
        ],
      },
    ],
  },
  {
    name: "Consolas y Videojuegos",
    slug: "consolas",
    icon: "🎮",
    hue: 275,
    leaves: [
      {
        name: "Consolas",
        slug: "consolas-consolas",
        icon: "🕹️",
        blueprints: [
          b("Sony", "PlayStation 5 Slim 1tb", ["Con Lector", "Digital"], [890000, 1100000], {
            specs: { Almacenamiento: "1 TB SSD", Resolución: "Hasta 4K 120Hz", Incluye: "Joystick DualSense" },
          }),
          b("Microsoft", "Xbox Series X 1tb", ["1 TB"], [980000, 1160000], {
            specs: { Almacenamiento: "1 TB SSD", Resolución: "4K UHD", Incluye: "Joystick inalámbrico" },
          }),
          b("Microsoft", "Xbox Series S 512gb", ["512 GB"], [520000, 650000], {
            specs: { Almacenamiento: "512 GB SSD", Resolución: "1440p", Incluye: "Joystick inalámbrico" },
          }),
          b("Nintendo", "Switch OLED 64gb", ["Blanco", "Neón"], [580000, 710000], {
            specs: { Pantalla: '7" OLED', Almacenamiento: "64 GB", Modos: "TV / Portátil / Mesa" },
          }),
        ],
      },
      {
        name: "Videojuegos",
        slug: "consolas-videojuegos",
        icon: "🎯",
        blueprints: [
          p("Juego Ps5 Ea Sports Fc 26 Standard Físico", [70000, 98000], "EA Sports"),
          p("Juego Ps5 Grand Theft Auto V Físico", [42000, 60000], "Rockstar Games"),
          p("Juego Nintendo Switch Mario Kart 8 Deluxe", [62000, 80000], "Nintendo"),
          p("Juego Xbox Call Of Duty Black Ops 6 Físico", [68000, 90000], "Activision"),
          p("Juego Ps5 Elden Ring Físico", [52000, 70000], "Bandai Namco"),
          p("Juego Nintendo Switch Zelda Tears Of The Kingdom", [66000, 86000], "Nintendo"),
        ],
      },
      {
        name: "Accesorios Gaming",
        slug: "consolas-accesorios",
        icon: "🎮",
        blueprints: [
          p("Joystick Sony Dualsense Ps5 Blanco Generación 2", [110000, 148000], "Sony"),
          p("Joystick Microsoft Xbox Series X Negro Inalámbrico", [95000, 132000], "Microsoft"),
          p("Auricular Gamer Redragon Zeus X H510 Rgb Con Micrófono", [58000, 80000], "Redragon"),
          p("Silla Gamer Cougar Explore Black Reclinable", [230000, 315000], "Cougar"),
          p("Volante Logitech G29 Driving Force Ps5 Ps4 Pc", [420000, 530000], "Logitech"),
        ],
      },
    ],
  },
  {
    name: "Hogar y Muebles",
    slug: "hogar",
    icon: "🛋️",
    hue: 32,
    leaves: [
      {
        name: "Living y Sala",
        slug: "hogar-living",
        icon: "🛋️",
        blueprints: [
          p("Sofá 3 Cuerpos Chenille Patas De Madera 180cm", [340000, 470000], "Confort House"),
          p("Mesa De Living Vidrio Templado 100x60 Moderna", [95000, 145000], "Noro"),
          p("Sillón Reclinable Pana Con Apoyabrazos Y Puff", [135000, 195000], "Re-Deco"),
          p("Alfombra Geométrica 160x230 Antideslizante", [42000, 70000], "Decorflex"),
          p("Lámpara De Pie Trípode Madera Pantalla De Tela", [38000, 60000], "Lumica"),
        ],
      },
      {
        name: "Cocina y Comedor",
        slug: "hogar-cocina",
        icon: "🍽️",
        blueprints: [
          p("Juego De Ollas Antiadherentes 10 Piezas Acero Inoxidable", [68000, 100000], "Essen"),
          p("Juego De Cuchillos De Cocina 6 Piezas Con Taco De Madera", [28000, 46000], "Tramontina"),
          p("Batería De Cocina Aluminio 7 Piezas Con Tapa De Vidrio", [58000, 88000], "Wilton"),
          p("Mesa De Comedor Extensible 6 Personas Madera", [145000, 220000], "Noro"),
          p("Set De 4 Sillas Nórdicas Patas De Madera Maciza", [78000, 118000], "La Compere"),
        ],
      },
      {
        name: "Dormitorio",
        slug: "hogar-dormitorio",
        icon: "🛏️",
        blueprints: [
          p("Colchón De Espuma Alta Densidad 190x140 30cm Con Sommier", [230000, 340000], "Cannon"),
          p("Juego De Sábanas 2 Plazas Algodón 240 Hilos", [42000, 70000], "Cannon"),
          p("Mesa De Luz 2 Cajones Melamina Blanca", [32000, 50000], "Simm"),
          p("Cama Sommier 2 Plazas Con Resorte Ortopédico", [310000, 450000], "Piero"),
        ],
      },
      {
        name: "Decoración",
        slug: "hogar-decoracion",
        icon: "🖼️",
        blueprints: [
          p("Espejo Redondo Con Luz Led 60cm Moderno", [58000, 88000], "Decorflex"),
          p("Cuadro Decorativo Set 3 Piezas Lienzo Abstracto", [22000, 40000], "Decorflex"),
          p("Organizador Escandinavo De Bambú Multiuso", [18000, 30000], "Bambú Deco"),
          p("Reloj De Pared Moderno Silencioso 30cm", [16500, 28000], "DecoTime"),
          p("Portarretratos Set 6 Fotos Collage De Madera", [12000, 22000], "Vintage"),
        ],
      },
    ],
  },
  {
    name: "Electrodomésticos",
    slug: "electrodomesticos",
    icon: "🧊",
    hue: 190,
    leaves: [
      {
        name: "Heladeras",
        slug: "electro-heladeras",
        icon: "🧊",
        blueprints: [
          b("Gafa", "Heladera No Frost HGF-387 367lt", ["Inox"], [780000, 960000], { specs: { Capacidad: "367 litros", Tecnología: "No Frost", Eficiencia: "A+" } }),
          b("Patrick", "Heladera Cíclica HPK-391 391lt", ["Blanco"], [690000, 860000], { specs: { Capacidad: "391 litros", Tecnología: "Cíclica" } }),
          b("Whirlpool", "Heladera No Frost WRM45 386lt", ["Plata"], [820000, 1000000], { specs: { Capacidad: "386 litros", Tecnología: "No Frost", Dispenser: "Agua" } }),
        ],
      },
      {
        name: "Lavarropas",
        slug: "electro-lavarropas",
        icon: "🧺",
        blueprints: [
          b("Samsung", "Lavarropas Automático 9.5kg WF95K5", ["Blanco"], [690000, 870000], { specs: { Carga: "9.5 kg", Tipo: "Automático", RPM: "1200" } }),
          b("Drean", "Lavarropas Cíclico Next 6kg 800rpm", ["Blanco"], [480000, 630000], { specs: { Carga: "6 kg", Tipo: "Cíclico", RPM: "800" } }),
          b("LG", "Lavarropas Automático 11kg Eco Bubble", ["Plata"], [850000, 1080000], { specs: { Carga: "11 kg", Tipo: "Automático", Tecnología: "Eco Bubble" } }),
        ],
      },
      {
        name: "Aires Acondicionados",
        slug: "electro-aire",
        icon: "❄️",
        blueprints: [
          b("Philco", "Split Frío/Calor 3000 Fcs", ["3000 frigorías"], [690000, 890000], { specs: { Potencia: "3000 frigorías", Eficiencia: "Clase A" } }),
          b("Surrey", "Split Inverter 2500w 555ai", ["2500w"], [520000, 690000], { specs: { Potencia: "2500 W", Tecnología: "Inverter" } }),
          b("BGH", "Split Frío/Calor 3200w Silent", ["3200w"], [720000, 930000], { specs: { Potencia: "3200 W", "Nivel sonoro": "Silent" } }),
        ],
      },
      {
        name: "Pequeños Electrodomésticos",
        slug: "electro-pequenos",
        icon: "☕",
        blueprints: [
          p("Cafetera Oster Prima Latte 20 Bar Espresso", [400000, 530000], "Oster"),
          p("Cafetera Dolce Gusto Genio S Plus Automática", [180000, 245000], "Nescafé"),
          p("Licuadora Philips 3000w Vaso De Vidrio", [95000, 145000], "Philips"),
          p("Tostadora Peabody Tm800 2 Rebanadas", [45000, 70000], "Peabody"),
          p("Pava Eléctrica Atma 1.7lt Acero Inoxidable", [32000, 50000], "Atma"),
          p("Procesadora Philips 700w Con Licuadora Y Batidor", [115000, 165000], "Philips"),
          p("Batidora Planetaria Oster 500w Bowl 4lt", [98000, 138000], "Oster"),
        ],
      },
      {
        name: "Aspiradoras",
        slug: "electro-aspiradoras",
        icon: "🧹",
        blueprints: [
          b("Xiaomi", "Robot Aspirador Mi Robot Vacuum S10+", ["Negro"], [390000, 520000], { specs: { Tipo: "Robot", Aspiración: "4000 Pa", App: "Mi Home" } }),
          b("Electrolux", "Aspiradora Trapeador Ergorapido Inalámbrica", ["Rojo"], [240000, 335000], { specs: { Tipo: "Vertical 2 en 1", Autonomía: "45 min" } }),
          b("Drean", "Aspiradora Vertical Vforce 2en1 1600w", ["Azul"], [95000, 148000], { specs: { Potencia: "1600 W", Tipo: "2 en 1" } }),
        ],
      },
    ],
  },
  {
    name: "Deportes y Fitness",
    slug: "deportes",
    icon: "⚽",
    hue: 145,
    leaves: [
      {
        name: "Bicicletas",
        slug: "deportes-bicicletas",
        icon: "🚲",
        blueprints: [
          b("Raleigh", "Mountain Bike Rodado 29 21 Velocidades", ["Rodado 29"], [230000, 345000], {
            colors: ["Negro/Azul", "Rojo", "Gris"],
            specs: { Rodado: "29", Cambios: "21 velocidades Shimano", Frenos: "Disco mecánico" },
          }),
          b("Sierras", "Mountain Bike Rodado 26 18 Velocidades", ["Rodado 26"], [165000, 235000], {
            colors: ["Negro", "Blanco"],
            specs: { Rodado: "26", Cambios: "18 velocidades" },
          }),
          b("Venzo", "Bicicleta De Ruta Speed 700c 14v", ["Rodado 700"], [290000, 400000], {
            colors: ["Blanco", "Gris"],
            specs: { Rodado: "700c", Cambios: "14 velocidades", Cuadro: "Aluminio" },
          }),
          b("Sierras", "Bicicleta Plegable Rodado 20 6v", ["Rodado 20"], [140000, 198000], {
            colors: ["Negro", "Azul"],
            specs: { Rodado: "20", Plegable: "Sí" },
          }),
        ],
      },
      {
        name: "Calzado Deportivo",
        slug: "deportes-calzado",
        icon: "👟",
        blueprints: [
          b("Nike", "Air Max 90", ["39", "40", "41", "42", "43"], [165000, 215000], { colors: ["Blanco/Negro", "Triple Black"], specs: { Uso: "Urbano / Running", Amortiguación: "Air Max" } }),
          b("Adidas", "Ultraboost 1.0 Running", ["40", "41", "42", "43"], [195000, 250000], { colors: ["Negro", "Blanco"], specs: { Uso: "Running", Amortiguación: "Boost" } }),
          b("Puma", "RS-X Reinvention Unisex", ["39", "40", "41", "42"], [130000, 180000], { colors: ["Blanco", "Negro"], specs: { Uso: "Urbano" } }),
          b("New Balance", "550 Unisex", ["40", "41", "42", "43"], [150000, 200000], { colors: ["Blanco/Verde", "Blanco/Azul"], specs: { Uso: "Urbano" } }),
          b("Topper", "Flash Retro Training", ["39", "40", "41", "42"], [68000, 95000], { colors: ["Blanco", "Negro"], specs: { Uso: "Training" } }),
        ],
      },
      {
        name: "Gym y Fitness",
        slug: "deportes-gym",
        icon: "🏋️",
        blueprints: [
          p("Mancuernas Ajustables 20kg Par Con Barra Y Discos", [48000, 74000], "Gym Pro"),
          p("Kit Gym En Casa Bandas Elásticas + Colchoneta De Yoga", [22000, 38000], "Everlast"),
          p("Soga De Saltar Speed Rope Con Rulemanes", [12000, 20000], "Adidas"),
          p("Barra De Dominadas Multiagen Para Puerta 100kg", [38000, 58000], "Sports Gym"),
          p("Cinta De Correr Plegable Eléctrica 2.5hp", [690000, 900000], "Movement"),
        ],
      },
      {
        name: "Running y Outdoor",
        slug: "deportes-running",
        icon: "🥾",
        blueprints: [
          p("Mochila Running 15lt Con Portabidón Y Silbato", [32000, 50000], "Under Armour"),
          p("Botella Térmica Deportiva 1lt Acero Inoxidable", [18000, 29000], "Contigo"),
          p("Carpa Camping 4 Personas Impermeable Armado En 3 Segundos", [68000, 100000], "Coleman"),
          p("Bolsa De Dormir -5°C 200x75cm Con Transporte", [34000, 54000], "Coleman"),
        ],
      },
    ],
  },
  {
    name: "Moda",
    slug: "moda",
    icon: "👟",
    hue: 340,
    leaves: [
      {
        name: "Zapatillas",
        slug: "moda-zapatillas",
        icon: "👟",
        blueprints: [
          b("Adidas", "Superstar Classic Unisex", ["39", "40", "41", "42", "43"], [95000, 140000], { colors: ["Blanco/Negro", "Triple Black"], specs: { Estilo: "Urbano clásico" } }),
          b("Vans", "Old Skool Black Unisex", ["39", "40", "41", "42"], [105000, 145000], { colors: ["Negro/Blanco"], specs: { Estilo: "Skate" } }),
          b("Converse", "Chuck Taylor All Star", ["38", "39", "40", "41", "42"], [85000, 125000], { colors: ["Negro", "Blanco", "Rojo"], specs: { Estilo: "Clásico" } }),
          b("Nike", "Court Vision Low", ["40", "41", "42", "43"], [99000, 140000], { colors: ["Blanco", "Negro"], specs: { Estilo: "Urbano" } }),
          b("Reebok", "Classic Leather Retro", ["39", "40", "41", "42"], [88000, 130000], { colors: ["Blanco", "Negro"], specs: { Estilo: "Retro" } }),
          b("Topper", "Caution Low Lona", ["39", "40", "41", "42", "43"], [55000, 80000], { colors: ["Blanco", "Negro/Azul"], specs: { Estilo: "Casual" } }),
        ],
      },
      {
        name: "Ropa",
        slug: "moda-ropa",
        icon: "👕",
        blueprints: [
          p("Remera Básica Algodón Peinado 24/2 Lisa Hombre", [15000, 25000], "Tascani", { Talle: "S al XXL", Material: "Algodón 100%" }),
          p("Jean Recto Elastizado Azul Hombre", [32000, 50000], "Wrangler", { Corte: "Recto", Material: "Denim con elastano" }),
          p("Campera Rompeviento Impermeable Con Capucha", [42000, 70000], "Athix", { Material: "Poliamida", Capucha: "Desmontable" }),
          p("Buzo Frisado Canguro Algodón Unisex", [28000, 46000], "Tascani", { Material: "Algodón frisado" }),
          p("Camisa Jean Lavada Manga Larga Hombre", [30000, 48000], "Wrangler", { Material: "Denim" }),
          p("Pantalón Cargo Jogger Algodón Unisex", [26000, 44000], "Athix", { Estilo: "Jogger" }),
        ],
      },
      {
        name: "Relojes",
        slug: "moda-relojes",
        icon: "⌚",
        blueprints: [
          b("Casio", "G-Shock Digital Resistente", ["DW-5600"], [95000, 140000], { colors: ["Negro", "Verde Militar"], specs: { Movimiento: "Digital", Resistencia: "200m" } }),
          b("Timex", "Indiglo Análogo Acero", ["Standard"], [85000, 130000], { colors: ["Acero"], specs: { Movimiento: "Cuarzo", Correa: "Acero" } }),
          b("Fossil", "Machine Cronógrafo Cuero", ["Standard"], [280000, 370000], { colors: ["Marrón", "Negro"], specs: { Movimiento: "Cuarzo cronógrafo", Correa: "Cuero" } }),
          b("Seiko", "5 Automático Acero Cristal Zafiro", ["SRPD"], [420000, 550000], { colors: ["Azul", "Verde"], specs: { Movimiento: "Automático", Cristal: "Zafiro" } }),
          b("Lorus", "Análogo Dama Acero", ["Standard"], [55000, 80000], { colors: ["Dorado", "Plateado"], specs: { Movimiento: "Cuarzo", Género: "Dama" } }),
        ],
      },
      {
        name: "Bolsos y Mochilas",
        slug: "moda-bolsos",
        icon: "🎒",
        blueprints: [
          p("Mochila Antirrobo Porta Notebook 15.6 Impermeable", [38000, 60000], "Samsonite", { Capacidad: "25 litros", Compartimentos: "3" }),
          p("Bandolera Urban Crossbody Hombre", [22000, 38000], "Billabong"),
          p("Bolso Tote Shopper Algodón Reforzado", [18000, 30000], "Tanak"),
          p("Riñonera Deportiva Con Portacelular", [15000, 25000], "Adidas"),
        ],
      },
    ],
  },
  {
    name: "Belleza y Cuidado Personal",
    slug: "belleza",
    icon: "💄",
    hue: 315,
    leaves: [
      {
        name: "Perfumes",
        slug: "belleza-perfumes",
        icon: "🌸",
        blueprints: [
          b("Dior", "Sauvage Eau De Parfum", ["100ml"], [168000, 220000], { specs: { Familia: "Aromática fougère", Género: "Masculino" } }),
          b("Carolina Herrera", "Good Girl Eau De Parfum", ["80ml"], [135000, 180000], { specs: { Familia: "Oriental floral", Género: "Femenino" } }),
          b("Versace", "Eros Eau De Toilette", ["100ml"], [98000, 138000], { specs: { Familia: "Aromática fougère", Género: "Masculino" } }),
          b("Chanel", "Bleu De Chanel Eau De Parfum", ["100ml"], [215000, 275000], { specs: { Familia: "Amaderada aromática", Género: "Masculino" } }),
          b("Paco Rabanne", "1 Million Eau De Toilette", ["100ml"], [95000, 135000], { specs: { Familia: "Especiada", Género: "Masculino" } }),
          b("Yves Saint Laurent", "Libre Eau De Parfum", ["90ml"], [145000, 190000], { specs: { Familia: "Floral amaderada", Género: "Femenino" } }),
        ],
      },
      {
        name: "Cuidado de la Piel",
        slug: "belleza-piel",
        icon: "🧴",
        blueprints: [
          p("Serum Facial Vitamina C 30ml Hidratante Y Luminosidad", [22000, 36000], "CeraVe"),
          p("Protector Solar Facial Fps 50+ 60ml Toque Seco", [24000, 40000], "La Roche-Posay"),
          p("Crema Hidratante Facial Lotion 52ml Piel Seca", [19000, 30000], "CeraVe"),
          p("Limpiador Facial Gel Espumoso 236ml", [17000, 27000], "Neutrogena"),
          p("Contorno De Ojos Ácido Hialurónico 15ml", [16000, 26000], "The Ordinary"),
        ],
      },
      {
        name: "Cuidado del Cabello",
        slug: "belleza-cabello",
        icon: "💇",
        blueprints: [
          p("Secador De Pelo Profesional 2200w Iónico", [45000, 70000], "Philips"),
          p("Planchita De Pelo Ceramic Tourmaline", [58000, 88000], "Gama"),
          p("Shampoo Y Acondicionador Reparación Total 400ml X2", [22000, 34000], "Pantene"),
          p("Mascarilla Capilar Keratina 300g", [26000, 40000], "L'Oréal Paris"),
        ],
      },
      {
        name: "Maquillaje",
        slug: "belleza-maquillaje",
        icon: "💅",
        blueprints: [
          p("Base De Maquillaje Mate Larga Duración 30ml", [22000, 36000], "Maybelline"),
          p("Labial Líquido Matte 12hs 6ml", [12000, 20000], "Maybelline"),
          p("Paleta De Sombras 18 Colores Tonos Nude", [18000, 30000], "Ruby Rose"),
          p("Máscara De Pestañas Volumen Extremo", [15000, 25000], "Maybelline"),
          p("Corrector De Ojeras Alta Cobertura 8ml", [13000, 22000], "Ruby Rose"),
        ],
      },
    ],
  },
  {
    name: "Juguetes y Bebés",
    slug: "juguetes",
    icon: "🧸",
    hue: 48,
    leaves: [
      {
        name: "Juegos de Mesa",
        slug: "juguetes-mesa",
        icon: "🎲",
        blueprints: [
          p("Juego De Mesa Monopoly Clásico Familiar", [26000, 40000], "Hasbro"),
          p("Juego De Mesa T.E.G. Clásico Táctico", [32000, 47000], "Yetem"),
          p("Juego De Cartas Uno Original", [9000, 16000], "Mattel"),
          p("Juego De Mesa Ruleta De La Suerte Para Fiestas", [11000, 19000], "Yetem"),
        ],
      },
      {
        name: "LEGO y Bloques",
        slug: "juguetes-bloques",
        icon: "🧱",
        blueprints: [
          b("Lego", "Classic Caja De Ladrillos Creativos", ["Mediana"], [70000, 100000], { specs: { Piezas: "484", Edad: "4+" } }),
          b("Lego", "Star Wars Caza Ala-X Del Mandaloriano", ["Standard"], [85000, 122000], { specs: { Piezas: "351", Edad: "8+" } }),
          b("Lego", "Technic Auto Deportivo", ["Standard"], [95000, 138000], { specs: { Piezas: "845", Edad: "9+" } }),
          b("Rasti", "Bloques De Encastre 200 Piezas", ["200 piezas"], [18000, 30000], { specs: { Piezas: "200", Edad: "3+" } }),
        ],
      },
      {
        name: "Juguetes",
        slug: "juguetes-juguetes",
        icon: "🪀",
        blueprints: [
          p("Muñeca Barbie Dreamtopia Sirena", [22000, 36000], "Barbie"),
          p("Pista Hot Wheels Loop De Aventuras", [28000, 44000], "Hot Wheels"),
          p("Auto A Control Remoto 1:16 4x4 2.4ghz", [38000, 60000], "Maisto"),
          p("Peluche Oso Grande 80cm", [26000, 44000], "Wabro"),
          p("Juego De Té De Juguete 15 Piezas", [14000, 24000], "Bright Starts"),
        ],
      },
      {
        name: "Bebés",
        slug: "juguetes-bebes",
        icon: "🍼",
        blueprints: [
          p("Cochecito De Bebé Travel System 3 En 1 Con Huevito", [185000, 270000], "Love'n Care"),
          p("Practicuna Corral Con Moisés Y Cambiador", [95000, 148000], "Infanti"),
          p("Bañera Para Bebé Con Soporte Antideslizante Y Tapón", [32000, 50000], "Bubble"),
          p("Silla De Comer Para Bebé 3 En 1 Reclinable", [68000, 100000], "Infanti"),
        ],
      },
    ],
  },
  {
    name: "Herramientas y Construcción",
    slug: "herramientas",
    icon: "🔧",
    hue: 15,
    leaves: [
      {
        name: "Herramientas Eléctricas",
        slug: "herramientas-electricas",
        icon: "🔨",
        blueprints: [
          b("Black+Decker", "Taladro Atornillador Percutor 750w", ["Standard"], [58000, 85000], { specs: { Potencia: "750 W", Velocidad: "Variable", Incluye: "Maletín" } }),
          b("DeWalt", "Amoladora Angular 115mm 900w", ["Standard"], [78000, 118000], { specs: { Potencia: "900 W", Disco: "115 mm" } }),
          b("Bosch", "Taladro Percutor Gsb 13re 600w", ["Standard"], [85000, 122000], { specs: { Potencia: "600 W", Mandril: "13 mm" } }),
          b("Einhell", "Sierra Circular 7 1/4 1400w", ["Standard"], [98000, 142000], { specs: { Potencia: "1400 W", Disco: '7 1/4"' } }),
          b("Black+Decker", "Lijadora Orbital 1/4 Hoja", ["Standard"], [42000, 64000], { specs: { Potencia: "230 W", Tipo: "Orbital" } }),
          b("Tinco", "Soldadora Inversora 200a Portátil", ["Standard"], [135000, 198000], { specs: { Corriente: "200 A", Tecnología: "Inversora" } }),
        ],
      },
      {
        name: "Herramientas Manuales",
        slug: "herramientas-manuales",
        icon: "🧰",
        blueprints: [
          b("Stanley", "Caja De Herramientas 108 Piezas Con Maletín", ["108 piezas"], [45000, 70000], { specs: { Piezas: "108", Incluye: "Maletín" } }),
          b("Stanley", "Juego Llaves Combinadas 8-19mm 12 Piezas", ["12 piezas"], [28000, 46000], { specs: { Piezas: "12" } }),
          p("Set Destornilladores De Precisión 64 En 1", [16000, 28000], "Klein Tools"),
          p("Nivel Láser 3 Líneas Verde Autonivelante", [28000, 44000], "Bosch"),
          p("Cinta Métrica 8m Acero Con Traba", [9000, 16000], "Stanley"),
        ],
      },
      {
        name: "Construcción",
        slug: "herramientas-construccion",
        icon: "🏗️",
        blueprints: [
          p("Escalera De Aluminio Tijera 3 Peldaños 1.5m", [42000, 64000], "Woben"),
          p("Compresor De Aire 50lt 2hp 8 Bar", [180000, 265000], "Bel'Aire"),
          p("Carretilla De Obra Reforzada 60lt Rueda Inflable", [38000, 58000], "Kalop"),
          p("Mezcladora De Cemento 1/2hp", [95000, 145000], "Bel'Aire"),
        ],
      },
    ],
  },
  {
    name: "Industrias y Oficina",
    slug: "oficina",
    icon: "🖨️",
    hue: 240,
    leaves: [
      {
        name: "Impresoras",
        slug: "oficina-impresoras",
        icon: "🖨️",
        blueprints: [
          b("Epson", "Multifunción L3250 Sistema Continuo", ["Wi-Fi"], [290000, 375000], { specs: { Funciones: "Imprime / Escanea / Copia", Conectividad: "Wi-Fi / USB" } }),
          b("HP", "Smart Tank 530 Tanque De Tinta", ["Wi-Fi"], [240000, 315000], { specs: { Funciones: "Multifunción", Conectividad: "Wi-Fi / USB" } }),
          b("Brother", "Láser Multifunción DCP-1602", ["Monocromática"], [230000, 300000], { specs: { Tecnología: "Láser", Color: "Monocromática" } }),
          b("Canon", "Impresora Fotográfica Selphy CP1500", ["Con Wi-Fi"], [185000, 250000], { specs: { Tipo: "Fotográfica", Conectividad: "Wi-Fi" } }),
        ],
      },
      {
        name: "Mobiliario de Oficina",
        slug: "oficina-mobiliario",
        icon: "🪑",
        blueprints: [
          p("Silla De Oficina Ergonómica Reclinable Con Malla", [95000, 148000], "Delly"),
          p("Escritorio De Oficina 120cm Con Cajón Y Estante", [78000, 118000], "Treviflex"),
          p("Archivador Metálico 4 Cajones Con Ruedas", [58000, 88000], "Rupp"),
          p("Panel Divisorio De Oficina 160x60cm", [38000, 58000], "Rupp"),
        ],
      },
      {
        name: "Insumos",
        slug: "oficina-insumos",
        icon: "📎",
        blueprints: [
          p("Resma Papel A4 75gr 500 Hojas", [8500, 13500], "Autor"),
          p("Tóner HP 26a CF226a Original", [38000, 54000], "HP"),
          p("Tinta Epson 544 Original Color Negro", [15000, 23000], "Epson"),
          p("Calculadora Científica Casio Fx-991la Plus", [38000, 54000], "Casio"),
          p("Set De 12 Biromes Trazo Fino Azul", [6000, 11000], "Bic"),
        ],
      },
    ],
  },
  {
    name: "Instrumentos Musicales",
    slug: "musica",
    icon: "🎸",
    hue: 288,
    leaves: [
      {
        name: "Guitarras",
        slug: "musica-guitarras",
        icon: "🎸",
        blueprints: [
          b("Yamaha", "Guitarra Criolla Clásica C40 4/4", ["Standard"], [115000, 162000], { colors: ["Natural", "Negra"], specs: { Tipo: "Criolla", Cuerdas: "Nylon" } }),
          b("Fender", "Guitarra Eléctrica Squier Stratocaster", ["Standard"], [320000, 425000], { colors: ["Sunburst", "Negra", "Roja"], specs: { Tipo: "Eléctrica", Pastillas: "3 single coil" } }),
          b("Tagima", "Guitarra Electroacústica Dallas 39", ["Standard"], [135000, 188000], { colors: ["Natural", "Sunburst"], specs: { Tipo: "Electroacústica", Ecualizador: "Activo" } }),
          b("Ashton", "Ukelele Soprano Mahogany Con Funda", ["Soprano"], [45000, 70000], { colors: ["Natural"], specs: { Tipo: "Ukelele", Cuerdas: "Nylon" } }),
        ],
      },
      {
        name: "Teclados y Pianos",
        slug: "musica-teclados",
        icon: "🎹",
        blueprints: [
          b("Casio", "Teclado CT-S300 61 Teclas Sensibles", ["61 teclas"], [145000, 198000], { colors: ["Negro"], specs: { Teclas: "61 sensibles a la velocidad" } }),
          b("Yamaha", "Teclado PSR-F52 61 Teclas 112 Canciones", ["61 teclas"], [98000, 142000], { colors: ["Negro"], specs: { Teclas: "61", Ritmos: "112 canciones" } }),
          b("Kurzweil", "Piano Digital 88 Teclas Contrapesadas", ["88 teclas"], [420000, 585000], { colors: ["Negro"], specs: { Teclas: "88 contrapesadas", Pedales: "3" } }),
        ],
      },
      {
        name: "Audio e Instrumentos",
        slug: "musica-audio",
        icon: "🎤",
        blueprints: [
          b("Marshall", "Amplificador De Guitarra 15w Con Distorsión", ["15w"], [58000, 88000], { specs: { Potencia: "15 W", Canales: "2" } }),
          b("Ibanez", "Pedal De Efecto Overdrive TS9", ["Standard"], [78000, 112000], { specs: { Tipo: "Overdrive" } }),
          p("Micrófono Condensador Usb Con Trípode Y Pop Filter", [38000, 60000], "Rode"),
          p("Interfaz De Audio Focusrite Scarlett 2i2 4ta Gen", [180000, 248000], "Focusrite"),
        ],
      },
    ],
  },
  {
    name: "Mascotas",
    slug: "mascotas",
    icon: "🐶",
    hue: 96,
    leaves: [
      {
        name: "Alimentos",
        slug: "mascotas-alimentos",
        icon: "🦴",
        blueprints: [
          b("Royal Canin", "Alimento Perro Adulto Medium 15kg", ["15 kg"], [38000, 60000], { specs: { Mascota: "Perro", Etapa: "Adulto", Peso: "15 kg" } }),
          b("Pedigree", "Alimento Perro Cachorro 21kg", ["21 kg"], [42000, 64000], { specs: { Mascota: "Perro", Etapa: "Cachorro", Peso: "21 kg" } }),
          b("Pro Plan", "Alimento Gato Adulto 7.5kg", ["7.5 kg"], [46000, 70000], { specs: { Mascota: "Gato", Etapa: "Adulto", Peso: "7.5 kg" } }),
          b("Excellent", "Alimento Perro Raza Pequeña 15kg", ["15 kg"], [28000, 44000], { specs: { Mascota: "Perro", Raza: "Pequeña", Peso: "15 kg" } }),
          b("Cat's Best", "Arena Sanitaria Para Gatos Aglutinante 10kg", ["10 kg"], [14000, 23000], { specs: { Tipo: "Aglutinante", Peso: "10 kg" } }),
        ],
      },
      {
        name: "Accesorios para Mascotas",
        slug: "mascotas-accesorios",
        icon: "🐾",
        blueprints: [
          p("Cama Para Perro Grande Desenfundable 95cm", [38000, 60000], "Petzz"),
          p("Rascador Para Gato Torre Con Juguete 80cm", [28000, 46000], "Petzz"),
          p("Collar Retráctil Para Perro 8m Con Luz Led", [16000, 27000], "Flexi"),
          p("Comedero Automático Programable Para Perros Y Gatos", [22000, 36000], "PetSafe"),
          p("Transportadora Para Mascotas Talle Mediano", [32000, 50000], "Petzz"),
          p("Bebedero Fuente Automática 2.5lt Filtro Carbón", [24000, 38000], "PetSafe"),
        ],
      },
    ],
  },
];

export interface SellerBlueprint {
  sellerName: string;
  email: string;
  name: string;
  status: string | null;
  sales: number;
  rating: number;
  location: string;
  memberSince: number;
  phone: string;
}

export const SELLERS: SellerBlueprint[] = [
  { sellerName: "TecnoShop Argentina", email: "ventas@tecnoshop.com", name: "Diego Fernández", status: "MercadoLíder Platinum", sales: 12480, rating: 4.8, location: "Capital Federal", memberSince: 2015, phone: "11 5555-1201" },
  { sellerName: "CeluMundo", email: "hola@celumundo.com", name: "Mariela Suárez", status: "MercadoLíder Platinum", sales: 8930, rating: 4.7, location: "Capital Federal", memberSince: 2016, phone: "11 5555-1202" },
  { sellerName: "MegaTecno", email: "info@megatecno.com", name: "Rubén Aguirre", status: "MercadoLíder Gold", sales: 15600, rating: 4.6, location: "Rosario, Santa Fe", memberSince: 2012, phone: "341 555-1203" },
  { sellerName: "FraveStore", email: "contacto@fravestore.com", name: "Silvina Ríos", status: "MercadoLíder Platinum", sales: 23400, rating: 4.8, location: "La Plata, Buenos Aires", memberSince: 2010, phone: "221 555-1204" },
  { sellerName: "HouseElectro", email: "pedidos@houseelectro.com", name: "Gustavo Peralta", status: "MercadoLíder Gold", sales: 18700, rating: 4.5, location: "Capital Federal", memberSince: 2009, phone: "11 5555-1205" },
  { sellerName: "Córdoba Store", email: "ventas@cordobastore.com", name: "Natalia Bustos", status: "MercadoLíder Gold", sales: 11200, rating: 4.4, location: "Córdoba Capital", memberSince: 2011, phone: "351 555-1206" },
  { sellerName: "CompuGamer", email: "soporte@compugamer.com", name: "Leandro Sosa", status: "MercadoLíder Gold", sales: 9850, rating: 4.9, location: "Capital Federal", memberSince: 2014, phone: "11 5555-1207" },
  { sellerName: "Casa Única", email: "hola@casaunica.com", name: "Jimena Ferrer", status: "MercadoLíder Platinum", sales: 6500, rating: 4.7, location: "Capital Federal", memberSince: 2018, phone: "11 5555-1208" },
  { sellerName: "Deportes RD", email: "info@deportesrd.com", name: "Pablo Miranda", status: "MercadoLíder", sales: 4300, rating: 4.5, location: "Mendoza Capital", memberSince: 2019, phone: "261 555-1209" },
  { sellerName: "ModaTotal", email: "ventas@modatotal.com", name: "Camila Duarte", status: "MercadoLíder Gold", sales: 7600, rating: 4.6, location: "Palermo, Capital Federal", memberSince: 2017, phone: "11 5555-1210" },
  { sellerName: "BellezaShop", email: "hola@bellezashop.com", name: "Rocío Medina", status: "MercadoLíder Platinum", sales: 5400, rating: 4.8, location: "Martínez, Buenos Aires", memberSince: 2018, phone: "11 5555-1211" },
  { sellerName: "PetKing", email: "pedidos@petking.com", name: "Facundo Ledesma", status: "MercadoLíder", sales: 3200, rating: 4.7, location: "San Isidro, Buenos Aires", memberSince: 2020, phone: "11 5555-1212" },
  { sellerName: "Herramientas PRO", email: "ventas@herramientaspro.com", name: "Alejandro Vera", status: "MercadoLíder Gold", sales: 2900, rating: 4.6, location: "Bahía Blanca, Buenos Aires", memberSince: 2019, phone: "291 555-1213" },
  { sellerName: "SonidoTotal", email: "info@sonidototal.com", name: "Verónica Ibáñez", status: "MercadoLíder Gold", sales: 5100, rating: 4.5, location: "Mar del Plata, Buenos Aires", memberSince: 2017, phone: "223 555-1215" },
];

export const BUYERS = [
  { name: "Martín Gómez", email: "demo@trato.com", location: "Capital Federal", phone: "11 4444-0001" },
  { name: "Lucía Herrera", email: "lucia@trato.com", location: "Vicente López, Buenos Aires", phone: "11 4444-0002" },
  { name: "Carlos Núñez", email: "carlos@trato.com", location: "Córdoba Capital", phone: "351 444-0003" },
  { name: "Sofía Ramírez", email: "sofi@trato.com", location: "Rosario, Santa Fe", phone: "341 444-0004" },
  { name: "Javier Ortiz", email: "javier@trato.com", location: "Mendoza Capital", phone: "261 444-0005" },
];

export const DEMO_PASSWORD = "Demo1234";

export const REVIEW_TITLES: Record<number, string[]> = {
  5: ["Excelente", "Muy recomendable", "Superó mis expectativas", "Impecable", "Compra perfecta"],
  4: ["Muy bueno", "Buena compra", "Cumple", "Recomendable", "Buen producto"],
  3: ["Está bien", "Cumple", "Aceptable", "Regular", "Ni más ni menos"],
  2: ["No me convenció", "Decepcionante", "Por mejorar", "Regular"],
  1: ["No funcionó", "Pésima experiencia", "No lo recomiendo"],
};

export const REVIEW_COMMENTS: Record<number, string[]> = {
  5: [
    "Excelente producto, llegó antes de lo esperado. Muy recomendable.",
    "La calidad es superior, tal cual la descripción. Volvería a comprar sin dudar.",
    "Funciona de maravillas y el vendedor respondió todas mis dudas.",
    "Increíble relación precio-calidad. Lo recomiendo al 100%.",
    "Llegó en perfecto estado, bien embalado y con factura. Todo impecable.",
  ],
  4: [
    "Muy bueno, cumple con lo esperado. Le saco una estrella por la demora del envío.",
    "Buen producto, la relación precio-calidad es aceptable.",
    "Funciona bien, aunque el embalaje podría ser mejor.",
    "Recomendable, el manual podría ser más claro pero está bien.",
  ],
  3: [
    "Está bien por el precio, ni más ni menos.",
    "Cumple, pero esperaba un poco más de calidad.",
    "Funcional, aunque sin lujos.",
  ],
  2: [
    "No es lo que esperaba, la calidad es justita.",
    "Tardó mucho en llegar y vino con un detalle estético.",
    "Por este precio esperaba mejor terminación.",
  ],
  1: [
    "No funcionó, tuve que iniciar el reclamo.",
    "Llegó dañado, pésima experiencia.",
    "No lo recomiendo, dejó de funcionar a los días.",
  ],
};

export const QUESTION_POOL = [
  "¿Hacen factura A?",
  "¿Tienen stock disponible en color negro?",
  "¿Realizan envíos a todo el país?",
  "¿Cuánto tarda el envío a Córdoba?",
  "¿Aceptan todos los medios de pago?",
  "¿Viene con garantía oficial?",
  "¿Hacen envío en el día en Capital?",
  "¿El precio incluye IVA?",
  "¿Tiene disponible para retirar en sucursal?",
];

export const ANSWER_POOL = [
  "Sí, hacemos factura A y B. ¡Comprá con confianza!",
  "Sí, tenemos stock disponible. Podés comprar ahora mismo.",
  "Sí, enviamos a todo el país por Mercado Envíos.",
  "El envío a Córdoba demora entre 2 y 4 días hábiles.",
  "Sí, aceptamos tarjeta de crédito, débito y transferencia.",
  "Sí, incluye garantía oficial de 12 meses.",
  "Sí, contamos con envío en el día para Capital Federal.",
  "Sí, todos los precios incluyen IVA.",
  "Sí, podés coordinar el retiro en nuestra sucursal.",
];

export const BONUS_LINES = [
  "Producto original con garantía oficial de 12 meses.",
  "Envío gratis a todo el país con Mercado Envíos.",
  "Vendido por un vendedor verificado de Trato.",
  "Aceptamos devoluciones dentro de los 30 días.",
  "Compra protegida: si te arrepentís, te devolvemos el dinero.",
  "Incluye factura y embalaje reforzado para el traslado.",
];
