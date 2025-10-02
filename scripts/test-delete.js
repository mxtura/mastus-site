// Debug script: investigate why a Category cannot be deleted
// Usage: npm run db:test-delete -- <categoryCodeOrId>

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const arg = process.argv[2]
  if (!arg) {
    console.error('Usage: npm run db:test-delete -- <categoryCodeOrId>')
    process.exit(1)
  }

  // Resolve category by code or id
  const where = arg.length > 20 ? { id: arg } : { code: arg }
  const category = await prisma.category.findFirst({
    where,
    include: {
      _count: {
        select: { products: true, params: true }
      },
      products: { select: { id: true, name: true, categoryId: true }, take: 20 },
      params: {
        select: {
          id: true,
          visible: true,
          required: true,
          parameter: { select: { id: true, code: true, nameRu: true } }
        },
        take: 50
      }
    }
  })

  if (!category) {
    console.error('Category not found by', where)
    process.exit(2)
  }

  console.log('Category:', { id: category.id, code: category.code, nameRu: category.nameRu })
  console.log('Counts:', category._count)

  if (category.products?.length) {
    console.log('\nProducts (first 20):')
    category.products.forEach(p => console.log(` - ${p.id} :: ${p.name}`))
  } else {
    console.log('\nNo products linked.')
  }

  if (category.params?.length) {
    console.log('\nCategory Params (first 50):')
    category.params.forEach(cp => {
      console.log(` - ${cp.id} :: ${cp.parameter.code} (${cp.parameter.nameRu}) visible=${cp.visible} required=${cp.required}`)
    })
  } else {
    console.log('\nNo category params bound.')
  }

  // Try a safe delete attempt wrapped in transaction, to capture exact error
  console.log('\nAttempting delete (dry run with real call)...')
  try {
    await prisma.category.delete({ where: { id: category.id } })
    console.log('✅ Deleted successfully.')
  } catch (err) {
    console.error('❌ Delete failed.')
    if (err && err.code) console.error('Prisma code:', err.code)
    if (err && err.meta) console.error('Meta:', err.meta)
    console.error('Message:', err.message)

    // Extra: probe foreign key constraints via raw query (Postgres-specific)
    try {
      const fkRefs = await prisma.$queryRaw`SELECT tc.constraint_name, tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name, rc.delete_rule
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.referential_constraints AS rc
        ON tc.constraint_name = rc.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'category'`;

      console.log('\nForeign keys referencing Category:')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fkRefs.forEach((fk) => console.log(fk))
    } catch (e) {
      console.error('Failed to inspect FKs:', e.message)
    }
  }
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
