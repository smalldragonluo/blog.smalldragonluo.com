title: 「转」 UNICODE 与 UTF-8，UTF-16 的含义
date: 2015-01-08 16:57
tags:
 - 字符集
 - 字符编码
categories: 
 - 前端技术
 - 计算机
toc: true
description: 最初，Internet上只有一种字符集——ANSI的ASCII字符集(American Standard Code for Information Interchange， 美国信息交换标准码），它使用7 bits来表示一个字符，总共表示128个字符，后来IBM公司在此基础上进行了扩展，用8bit来表示一个字符，总共可以表示256个字符，充分利用了一个字节所能表达的最大信息。

---

最初，Internet上只有一种字符集——ANSI的ASCII字符集(American Standard Code for Information Interchange， 美国信息交换标准码），它使用7 bits来表示一个字符，总共表示128个字符，后来IBM公司在此基础上进行了扩展，用8bit来表示一个字符，总共可以表示256个字符，充分利用了一个字节所能表达的最大信息

#### ANSI字符集
 
ASCII字符集，以及由此派生并兼容的字符集，如：GB2312，正式的名称为MBCS（Multi-Byte Chactacter System，多字节字符系统），通常也称为ANSI字符集。

UNICODE 与 UTF8，UTF16 

由于每种语言都制定了自己的字符集，导致最后存在的各种字符集实在太多，在国际交流中要经常转换字符集非常不便。因此，产生了Unicode字符集，它固定使用16 bits（两个字节）来表示一个字符，共可以表示65536个字符
标准的Unicode称为UTF-16(UTF:UCS Transformation Format )。后来为了双字节的Unicode能够在现存的处理单字节的系统上正确传输，出现了UTF-8，使用类似MBCS的方式对Unicode进行编码 (Unicode字符集有多种编码形式)。例如“连通”两个字的Unicode标准编码UTF-16 (big endian）为：

DE 8F 1A 90

而其UTF-8编码为：

E8 BF 9E E9 80 9A

当一个软件打开一个文本时，它要做的第一件事是决定这个文本究竟是使用哪种字符集的哪种编码保存的。软件一般采用三种方式来决定文本的字符集和编码：
检测文件头标识，提示用户选择，根据一定的规则猜测最标准的途径是检测文本最开头的几个字节，开头字节Charset/encoding，如下表：

EF BB BF      UTF-8
FE FF         UTF-16/UCS-2, little endian
FF FE         UTF-16/UCS-2, big endian
FF FE 00 00   UTF-32/UCS-4, little endian
00 00 FE FF   UTF-32/UCS-4, big-endian

 
#### Unicode

unicode.org 制定的编码机制， 要将全世界常用文字都函括进去。在 1.0 中是 16 位编码， 由 U+0000 到 U+FFFF。 每个 2byte 码对应一个字符; 在 2.0 开始抛弃了 16 位限制， 原来的 16 位作为基本位平面， 另外增加了 16 个位平面， 相当于 20 位编码， 编码范围 0 到 0x10FFFF。

#### UCS

ISO 制定的 ISO10646 标准所定义的 Universal Character Set， 采用4byte编码。

Unicode 与 UCS 的关系:

ISO 与 unicode.org 是两个不同的组织， 因此最初制定了不同的标准; 但自从unicode2.0开始， unicode 采用了与 ISO 10646-1 相同的字库和字码， ISO 也承诺 ISO10646 将不会给超出 0x10FFFF 的 UCS-4 编码赋值， 使得两者保持一致。

UCS的编码方式:

UCS-2：与 unicode 的 2byte 编码基本一样。 

UCS-4：4byte 编码， 目前是在 UCS-2 前加上 2 个全零的 byte。

UTF：Unicode/UCS 
Transformation Format

UTF-8， 8bit编码， ASCII不作变换， 字符做变长编码， 每个字符 1-3 byte。 
通常作为外码。 有以下优点:

* 与CPU字节顺序无关， 可以在不同平台之间交流
* 容错能力高， 任何一个字节损坏后， 

最多只会导致一个编码码位损失， 不会链锁错误(如 GB 码错一个字节就会整行乱码) 

UTF-16， 16bit 编码， 是变长码， 大致相当于 20 位编码， 值在 0 到 0x10FFFF 之间， 基本上就是 unicode 编码的实现。 它是变长码， 与 CPU 字序有关， 但因为最省空间， 
常作为网络传输的外码。
UTF-16 是 unicode 的 preferred encoding。 

UTF-32， 
仅使用了 unicode 范围( 0 到 0x10FFFF)的 32 位编码， 
相当于UCS-4的子集。

UTF 与 unicode 的关系:

Unicode 是一个字符集， 
可以看作为内码。
而UTF是一种编码方式， 它的出现是因为 unicode 不适宜在某些场合直接传输和处理。 UTF-16 直接就是 unicode 编码， 
没有变换， 但它包含了 0x00 在编码内， 头 256 字节码的第一个 byte 都是 0x00， 在操作系统(C语言)中有特殊意义， 会引起问题。 
采用 UTF-8 编码对 unicode 的直接编码作些变换可以避免这问题， 并带来一些优点。

#### 中国国标编码

##### GB13000:

完全等同于 ISO 10646-1/Unicode 2.1， 今后也将随 ISO 10646/Unicode 的标准更改而同步更改。

##### GBK

对 GB2312 的扩充， 以容纳 GB2312 字符集范围以外的 Unicode 2.1 的统一汉字部分， 并且增加了部分 unicode 中没有的字符。 

##### GB18030-2000

基于 GB13000， 作为Unicode 3.0 的 GBK 扩展版本， 覆盖了所有 unicode 编码， 
地位等同于 UTF-8， UTF-16， 是一种 unicode 编码形式。 变长编码， 用单字节/双字节/4字节对字符编码。 
GB18030 向下兼容 GB2312/GBK。 
GB18030 是中国所有非手持/嵌入式计算机系统的强制实施标准。

[原文链接](http://fjzboy。blog。sohu。com/136319844.html)
