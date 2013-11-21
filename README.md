CEC
========

**Cross-End Canvas**

    - One-Canvas App Engine
    - A Individuation, High-performance and Straightforward solution of Cross-End[Web & Native]


## Feature

- 跨终端canvas渲染，从pc到mobile，从ie6 到 chrome，从web到native ，一体化的解决方案
- 绝对易用的api，方便的语法糖
- 无限嵌套组的概念
- 分层渲染，提升app渲染性能

## 构建方式

>
源码基于kissy的module的amd包装方式，但是不强依赖kissy。
build 出来的版本同时有基于kissy的版本和完全不依赖kissy的版本
  - build/cec/cec.js  可使用 `KISSY.use`
  - build/cec/cec-nokissy.js 完全无依赖的版本，所有api挂在一个全局对象`CEC`下

## Api Doc
https://github.com/hongru/cec/wiki/Api-Doc