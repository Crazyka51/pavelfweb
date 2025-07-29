import fs from "fs/promises"
import path from "path"

export class DataManager<T> {
  private filePath: string
  private backupDir: string

  constructor(fileName: string) {
    this.filePath = path.join(process.cwd(), "data", fileName)
    this.backupDir = path.join(process.cwd(), "data", "backups")
  }

  async ensureDirectories() {
    const dataDir = path.dirname(this.filePath)
    await fs.mkdir(dataDir, { recursive: true })
    await fs.mkdir(this.backupDir, { recursive: true })
  }

  async read(): Promise<T[]> {
    try {
      await this.ensureDirectories()
      const data = await fs.readFile(this.filePath, "utf-8")
      return JSON.parse(data)
    } catch (error) {
      // Pokud soubor neexistuje, vrátíme prázdné pole
      if ((error as any).code === "ENOENT") {
        return []
      }
      throw error
    }
  }

  async write(data: T[]): Promise<void> {
    await this.ensureDirectories()

    // Vytvoření zálohy před zápisem
    await this.createBackup()

    // Atomický zápis pomocí dočasného souboru
    const tempPath = this.filePath + ".tmp"
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2), "utf-8")
    await fs.rename(tempPath, this.filePath)
  }

  async createBackup(): Promise<void> {
    try {
      const data = await fs.readFile(this.filePath, "utf-8")
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      const backupPath = path.join(this.backupDir, `${path.basename(this.filePath, ".json")}-${timestamp}.json`)
      await fs.writeFile(backupPath, data, "utf-8")

      // Udržování pouze posledních 5 záloh
      await this.cleanupBackups()
    } catch (error) {
      // Ignorujeme chyby při zálohování pokud původní soubor neexistuje
      if ((error as any).code !== "ENOENT") {
        console.error("Backup creation failed:", error)
      }
    }
  }

  async cleanupBackups(): Promise<void> {
    try {
      const files = await fs.readdir(this.backupDir)
      const backupFiles = files
        .filter((file) => file.startsWith(path.basename(this.filePath, ".json")))
        .sort()
        .reverse()

      // Smazání starších záloh (ponecháme pouze 5 nejnovějších)
      for (const file of backupFiles.slice(5)) {
        await fs.unlink(path.join(this.backupDir, file))
      }
    } catch (error) {
      console.error("Backup cleanup failed:", error)
    }
  }

  async findById(id: string): Promise<T | null> {
    const data = await this.read()
    return data.find((item: any) => item.id === id) || null
  }

  async create(item: T & { id: string }): Promise<T> {
    const data = await this.read()
    const newItem = {
      ...item,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    data.push(newItem)
    await this.write(data)
    return newItem
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const data = await this.read()
    const index = data.findIndex((item: any) => item.id === id)

    if (index === -1) return null

    const updatedItem = {
      ...data[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    data[index] = updatedItem
    await this.write(data)
    return updatedItem
  }

  async delete(id: string): Promise<boolean> {
    const data = await this.read()
    const initialLength = data.length
    const filteredData = data.filter((item: any) => item.id !== id)

    if (filteredData.length === initialLength) return false

    await this.write(filteredData)
    return true
  }

  async bulkUpdate(ids: string[], updates: Partial<T>): Promise<T[]> {
    const data = await this.read()
    const updatedItems: T[] = []

    for (let i = 0; i < data.length; i++) {
      const item = data[i] as any
      if (ids.includes(item.id)) {
        const updatedItem = {
          ...item,
          ...updates,
          updatedAt: new Date().toISOString(),
        }
        data[i] = updatedItem
        updatedItems.push(updatedItem)
      }
    }

    await this.write(data)
    return updatedItems
  }

  async bulkDelete(ids: string[]): Promise<number> {
    const data = await this.read()
    const initialLength = data.length
    const filteredData = data.filter((item: any) => !ids.includes(item.id))

    await this.write(filteredData)
    return initialLength - filteredData.length
  }
}
