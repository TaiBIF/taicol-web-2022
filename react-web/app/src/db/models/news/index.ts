import New from './News'
import Category from '../Category'

New.belongsTo(Category)
Category.hasMany(New)


export { New,Category }
