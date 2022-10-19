import Download from './Download'
import Category from '../Category'

Download.belongsTo(Category)
Category.hasMany(Download)


export { Download,Category }
