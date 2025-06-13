# ra-data-simple-prisma

## 6.4.0

### Minor Changes

- optional transaction

## 6.3.0

### Minor Changes

- transaction

## 6.2.0

### Minor Changes

- add "has" operator

## 6.1.0

### Minor Changes

- add hasFieldChanged

## 6.0.1

### Major Changes

- No need to provide model to any handler, it is inferred from the request. createHandler(,`prisma.post`) => createHandler(,`prisma`)

## 5.5.0

### Minor Changes

- fix: getManyReference total count

## 5.4.0

### Minor Changes

- Allow inline field perms
- whitelist ids

## 5.3.0

### Minor Changes

- whitelist ids

## 5.2.1

### Patch Changes

- allow extended client

## 5.1.0

### allowKeys in update

## 5.0.0

### Breaking changes: Infinite List and nested where

- nested where (default dot notation)
- \_pgjson operator to drill down a postgres json field
- getInfiniteListHandler

## 4.0.2

### Fix null not added to filter

- in extractWhere

## 4.0.1

### Fix missing transform on handlers

- getMany and getManyReference

## 4.0.0

### Breaking changes on getOneHandler and getListHandler options

- add changelog file
- transformRow and transform must return value
