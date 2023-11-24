export interface MagazineI {
  title: string
  subtitle: string
  imageUrl: string
}

export interface RegionI {
  image: string
  name: string
  $id: string
}
export type RegionIScrollBlock = RegionI[]

export interface GalaryI {
  updatedAt: string
  description: string
  features: string
  lat: number
  location: string
  lon: number
  mainPhoto: string
  photos: string[]
  price: number
  regionID: string
  status: string
  $id: string
}
export type GalaryScrollBlock = GalaryI[]


export interface HeroBlock {
  upperText: string
  middleText: string
  bottomText: string
  bgVideoUrl: string
  bgVideoPoster: string
  bgVideoMimeType: string
}

export interface TwoSidesBlock {
  headerText: string
  mainText: string
  buttonContent: string
  posterUrl: string
  posterAlt?: string
}

export type MagazinesScrollBlock = MagazineI[]

export interface SponsorsBlock {
  imageUrls: string[]
}

export interface VideoPlayerBlock {
  videoUrl: string // ссылка на ролик
  backgroundImageUrl: string // ссылка на картинку с превью
}

export interface ContactBlock {
  backgroundUrl: string
  titleText: string
  buttonText: string
}

export interface FooterBlock {
  phoneNumber: string // для Contact Us
  mail: string // для Contact Us
  contactsInfo: string // для Contact Us
  address: string // для Address
  socialLinks: Array<{
    href: string //ссылка на соцсеть
    title: string //подпись
  }>
}
