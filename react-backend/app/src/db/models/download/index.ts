import Download from './Download'
import DownloadFile from './DownloadFile'
import Category from '../Category'

Download.belongsTo(Category, {foreignKey: "CategoryId"})
Category.hasMany(Download)
DownloadFile.belongsTo(Download)
Download.hasMany(DownloadFile)


export { Download,DownloadFile,Category }
