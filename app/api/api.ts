import { Client, Account, Databases, Functions, Models, Storage, ID } from 'appwrite'
import type {
  HeroBlock,
  TwoSidesBlock,
  MagazinesScrollBlock,
  GalaryScrollBlock,
  RegionIScrollBlock,
  RegionI,
  SponsorsBlock,
  VideoPlayerBlock,
  ContactBlock,
  FooterBlock,
} from './types'

let instance: null | Api = null

type BlockIds = 'hero' | 'twoSides' | 'magazinesScroll' | 'sponsors' | 'videoPlayer' | 'contact' | 'footer' | '654c917198f9d04b38c5'
type AnyBlock =
  | HeroBlock
  | TwoSidesBlock
  | MagazinesScrollBlock
  | SponsorsBlock
  | VideoPlayerBlock
  | ContactBlock
  | FooterBlock
type Filename =
  | 'hero-bgVideo'
  | 'hero-bgPoster'
  | 'twoSides-poster'
  | 'videoPlayer-video'
  | 'videoPlayer-poster'
  | 'contact-bgPoster'
  | 'magazinesScroll-image-*'
interface BlockDocument extends Models.Document {
  id: string // block name
  value: string // json block
}

class Api {
  sdk
  generalDB: string
  blocksCollection: string
  blockContentBucket: string
  magazinesImagesBucket: string
  galaryImagesBucket: string
  regionImagesBucket: string
  blockRegions: string
  regionsCollection: string
  blockHouses: string
  sponsorImagesBucket: string
  otherImagesBucket: string
  currentAccount: Models.Session | null
  docsIdMatcher: {
    [key: string]: string
  }

  constructor() {
    if (instance) {
      throw new Error('New API instance cannot be created!!')
    }
    instance = this
    const appwrite = new Client()
    appwrite.setEndpoint('https://appwrite.homesapp.ru/v1').setProject('65140369acf5f3040759')
    const functions = new Functions(appwrite)
    const account = new Account(appwrite)
    const database = new Databases(appwrite)
    const storage = new Storage(appwrite)
    this.sdk = { database, account, functions, storage }
    this.generalDB = '651c37077ab95bb6d02f'
    this.blocksCollection = '651c370ebdabc8f03125'
    this.blockContentBucket = '65221cff6c4a69775309'
    this.magazinesImagesBucket = '6528724093d26224fa76'

    // galaryImagesBucket
    this.galaryImagesBucket = '6555e8fcbfa39471492a'
    this.blockHouses = '654c917198f9d04b38c5'
    this.regionsCollection = '654c91790f602e9fadd3'
    this.regionImagesBucket = '655f202ded1cc87c9af8'
    this.blockRegions = '654c91790f602e9fadd3'


    this.sponsorImagesBucket = '6536f657c1f137705c6c'
    this.otherImagesBucket = '6536fb1714acfb91ffcd'
    this.currentAccount = null
    this.docsIdMatcher = {}
  }

  provider() {
    if (this.sdk) {
      return this.sdk
    }
  }

  //   readJWT() {
  //     const fullToken = window.localStorage.getItem('token') || ''
  //     if (!fullToken) return { hasToken: false }
  //     const token = fullToken.split('.')[1]
  //     const payload = JSON.parse(atob(token))
  //     return { ...payload, hasToken: true, fullToken }
  //   }

  uploadFile(filename: Filename, file: File) {
    return new Promise((res, rej) => {
      this.sdk.storage
        .deleteFile(this.blockContentBucket, filename)
        .then(() => this.sdk.storage.createFile(this.blockContentBucket, filename, file))
        .then(res)
        .catch(rej)
    })
  }

  uploadMagazineImage(filename: string, file: File) {
    return this.sdk.storage.createFile(this.magazinesImagesBucket, filename, file)
  }

  uploadSponsorImage(filename: string, file: File) {
    return this.sdk.storage.createFile(this.sponsorImagesBucket, filename, file)
  }

  async clearAllMagazineImages() {
    const allMagImages = await this.sdk.storage.listFiles(this.magazinesImagesBucket)
    return Promise.all(
      allMagImages.files.map(async (imgFile) => {
        this.sdk.storage.deleteFile(this.magazinesImagesBucket, imgFile.$id)
      })
    )
  }

  //   updateFile(filename: 'hero-bgVideo' | 'hero-bgPoster', file: File) {
  //     return this.sdk.storage.updateFile(this.blockContentBucket, filename, file)
  //   }

  checkIsAuth(logout: () => void) {
    if (this.currentAccount !== null) return
    this.sdk.account.get().catch(logout)
  }

  async createSession(email: string, password: string) {
    const session = await this.sdk.account.createEmailSession(email, password)
    if (session) this.currentAccount = session
    return session
  }

  async getAllDocs() {
    const allDocs = await this.sdk.database.listDocuments<BlockDocument>(
      this.generalDB,
      this.blocksCollection
    )
    allDocs.documents.forEach((doc) => {
      this.docsIdMatcher[doc.id] = doc.$id
    })
    return allDocs
  }

  async getBlock(type: BlockIds) {
    const allDocs = await this.getAllDocs()
    const curDoc = allDocs.documents.find((e) => e.id === type)
    if (curDoc) return curDoc.value
    return null
  }

  setBlock(blockName: BlockIds, blockData: AnyBlock) {
    return this.sdk.database.updateDocument(
      this.generalDB,
      this.blocksCollection,
      this.docsIdMatcher[blockName],
      { value: JSON.stringify(blockData, null, 2) }
    )
  }

  async getHero(): Promise<HeroBlock | null> {
    const block = await this.getBlock('hero')
    if (block) return JSON.parse(block) as HeroBlock
    return null
  }

  async getTwoSides(): Promise<TwoSidesBlock | null> {
    const block = await this.getBlock('twoSides')
    if (block) return JSON.parse(block) as TwoSidesBlock
    return null
  }


  async getMagazinesScroll(): Promise<MagazinesScrollBlock | null> {
    const block = await this.getBlock('magazinesScroll')
    if (block) return JSON.parse(block) as MagazinesScrollBlock
    return null
  }

  async getSponsors(): Promise<SponsorsBlock | null> {
    const block = await this.getBlock('sponsors')
    if (block) return JSON.parse(block) as SponsorsBlock
    return null
  }

  async getVideoPlayer(): Promise<VideoPlayerBlock | null> {
    const block = await this.getBlock('videoPlayer')
    if (block) return JSON.parse(block) as VideoPlayerBlock
    return null
  }

  async getContact(): Promise<ContactBlock | null> {
    const block = await this.getBlock('contact')
    if (block) return JSON.parse(block) as ContactBlock
    return null
  }

  async getFooter(): Promise<FooterBlock | null> {
    const block = await this.getBlock('footer')
    if (block) return JSON.parse(block) as FooterBlock
    return null
  }





  //////////////// GalaryImages//////////////// 
  uploadGalaryImage(filename: string, file: File) {
    return this.sdk.storage.createFile(this.galaryImagesBucket, filename, file)
  }

  //////////////// GalaryImages//////////////// 

  /////////////////////getGalaryScroll///////////////////////
  async getGalaryScroll(): Promise<GalaryScrollBlock | any> {
    let allGalary = await this.sdk.database.listDocuments(this.generalDB, this.blockHouses) // '[DATABASE_ID]', '[COLLECTION_ID]'

    return allGalary.documents
  }

  async updateGalaryScroll(blockData: AnyBlock, blockId: string): Promise<GalaryScrollBlock | null> {
    let block;
    console.log(blockData)
    if (blockId !== undefined) {
      block = await this.sdk.database.updateDocument(
        this.generalDB, this.blockHouses, blockId, JSON.stringify(blockData));
    } else {
      block = await this.sdk.database.createDocument(
        this.generalDB, this.blockHouses,
        ID.unique(),
        JSON.stringify(blockData)
      );
    }


    if (block) return block.documents as GalaryScrollBlock
    else return null
  }
  /////////////////////getGalaryScroll///////////////////////


  // deleteGalaryScroll
  async deleteGalaryScroll(blockId: string): Promise<any | null> {
    const block = await this.sdk.database.deleteDocument(this.generalDB, this.blockHouses, blockId);
    const updatedData = await this.getGalaryScroll()
    if (updatedData) return updatedData as any
    else return null
  }


  //||||||||||||||||||||||||||||||||||||Regions||||||||||||||||||||||||||||||||||||||||||||

  async getAllRegionsDocs() {
    return await this.sdk.database.listDocuments(this.generalDB, this.regionsCollection)
  }

  async getAllRegions() {
    const allDocs: any = await this.getAllRegionsDocs()
    return allDocs.documents
  }
  async deleteRegions(blockId: string): Promise<RegionIScrollBlock | any> {
    const block = await this.sdk.database.deleteDocument(this.generalDB, this.blockRegions, blockId);
    console.log(block)
    const updatedData = await this.getAllRegionsDocs()
    if (updatedData) return updatedData.documents as any
    else return null
  }

  async updateRegions(blockData: AnyBlock, blockId: string | undefined) {

    let block;
    if (blockId !== undefined) {
      block = await this.sdk.database.updateDocument(
        this.generalDB, this.regionsCollection, blockId, JSON.stringify(blockData));
    } else {
      block = await this.sdk.database.createDocument(
        this.generalDB, this.regionsCollection,
        ID.unique(),
        JSON.stringify(blockData)
      );
    }
    if (block) return block.documents as RegionIScrollBlock
    else return null
  }
  async uploadRegionImage(filename: string, file: File) {
    return this.sdk.storage.createFile(this.regionImagesBucket, filename, file)
  }

}



const api = new Api()

export { api }
