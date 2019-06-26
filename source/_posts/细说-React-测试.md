title: 细说 React 测试
tags:
  - React
  - 测试
categories:
  - 前端技术
toc: true
date: 2019-05-04 22:46:51
description: 「测试」是为了度量和提高软件质量，对测试软件进行工程设计、实施和维护的过程。测试的发展，逐步从“调试”为主，到“证明软件工作正确”，再到“证明软件存在错误”，再到今天的“预防”体系，经历了几十年的过程。可以说，测试已经成为软件质量的守卫者角色。

---

**「测试」**是为了度量和提高软件质量，对测试软件进行工程设计、实施和维护的过程。测试的发展，逐步从“调试”为主，到“证明软件工作正确”，再到“证明软件存在错误”，再到今天的“预防”体系，经历了几十年的过程。可以说，测试已经成为软件质量的守卫者角色。

近几年，自动化测试在前端领域日益活跃，各种前端测试工具层出不穷。但我们对自动化测试持有的态度却不尽相同，有的人认为测试只是一件政治正确的事情，实施起来，投入产出不成比例，因此部分项目里测试覆盖率不高，甚至没有。我们可能已经看过了很多介绍自动化测试的文章和教程，但如何理解测试，对于测试策略的制定更具有指导意义。

<a name="u7Qw9"></a>
## 为什么要前端测试

随着互联网行业的迅猛发展，开发团队对敏捷性提出了更高的要求。早期的几个月发布一次，已经跟不上业务扩张的步伐。对需求更快研发，更快调整，是决定业务成败的生命线。如果没有严格的测试来验证软件的正确性，开发者将**难以快速回归代码**，导致的结果就是**不敢重构**（最近团队也有类似的困境），只能不断往上堆叠，最终代码腐化，然后在某个时刻崩塌。

理想的情况是，为应对频繁快速的迭代，增加人员投入，对新增或重构的功能进行完整回归。但现实总有局限性，其表现在以下几个方面：

- 软件工程中，人力与开发时间不具有线性关系，过多的人力投入项目，如同建造一座巴别塔
- 不符合 DRY 原则，每次完整回归需要投入大量重复性工作，同时，企业内一般都面临着测试人员短缺的处境
- 人员流动是常态，新人进入前都有一个拼图阶段，这为持续迭代带来了更多挑战
- 开发者也需要对自己的代码回归负责，不能只顾写代码，然后通通丢给测试同学，这会给测试与合作方带来“可测试程度不高”的不好印象
- 人类（~~好吧我是指测试~~）总会失误，谁也不能保证测试结果一定可靠。有时万分之一的疏漏，就可能为线上带来灾难

良好的自动化测试，不仅为开发者提升了效率，形成正面影响（较好的测试用例通过率），也在另一个层面为测试者带来了价值。做好测试这一环，我们也才能进一步去考虑实现持续交付、持续部署的可能性，真正为业务的快速迭代给出答案。

<a name="O0X03"></a>
## 制定测试策略

如果你认可自动化测试的价值，那么接下来的问题是如何制定测试策略。开发者一开始会疑惑，应该从哪个层面着手，写到什么程度为止，因为你永远能写出更高覆盖率的测试。

我们可以从测试的粒度来看：

**单元测试：** 针对程序最小单位进行测试，可以是一个函数，过程或一个方法（OOP）。单元测试是极限编程的基础，有很强的错误隔离能力，方便快速定位问题，同时由于其自低向上的测试路径，使软件集成变得简单。缺点是不能发现集成错误和性能问题

**集成测试：** 在单元测试基础上，集成多个模块，组成系统或子系统，这能发现一些单元测试时不能发现的问题

**端到端测试：** 在终端上以用户视角（黑盒）测试产品的整体质量，如业务逻辑，UI 等。这个阶段的测试结果更贴近于产品的最终形态，一般是正式或准正式环境。编写端到端测试成本会比较高，首先是需要花费更多的时间在依赖集成上，其次是运行环境复杂，比如大量的异步操作需要被处理，以及很多时候我们并没有一个完整的后端沙箱链路可以用来测试

不同开发领域，对这三个阶段的划分多有不同。典型的，前端相比于后端，会有组件测试、UI 测试等。更具体的场景，比如 Redux 体系还会包含 Action、Reducer 等维度的测试，但如果你以某个标准将其归纳入上述阶段，会基本符合以下规律：

|  | **单元测试** | **集成测试** | **端到端测试** |
| --- | :---: | :---: | :---: |
| 执行效率 | 高 | 中 | 低 |
| 稳定复现 | 高 | 中 | 低 |
| 错误隔离 | 高 | 中 | 低 |
| 贴近真实 | 低 | 中 | 高 |

落地到项目时，由于单元测试更容易实施，收益相对直观，投入成本也能接受，所以优先编写单元测试是个好的选择。集成测试和端到端测试，因为依赖更多了，执行环境也愈加复杂，使得测试策略的编写更加困难。

虽然你可能在任何阶段出现 bug，但越接近终端运行阶段，bug 的数量会更少，而错误稳定性、错误隔离能力会降低，使得问题排查难度加大。同时，和测试策略一样，需求的变更与逻辑重构，在代码层面的影响也是自底向上的，这意味着越多上层的测试，带来的维护成本会变得更大，因此投入和产出比明显处于下降趋势。

下图是来自谷歌的测试金字塔：

![](/assets/1556243803276-e50ba577-322b-4a2a-8bf2-30ab0c4e297d.png)

可以解读为，越往上走，软件测试的覆盖程度越大，意味着能发现更多的问题。但同时，宽度变窄，因为此时测试投入成本曲线变得陡峭，收益降低，应该缩减投入比例。Google 测试团队建议以 70%、20%、10% 的比例分别投入单元测试，集成测试和端到端测试。

<a name="sgQMb"></a>
## 测试建议

- 编写测试代码时，建议以一种利于重构的方式去写，更多关注输入输出结果，保证工作正常，而不用对无关紧要的细节进行限制
- 只对稳定的、需求确定的项目进行测试，否则代码将面临较大改动
- 不建议测试 UI 样式，比如颜色，字体大小等，可以通过录制的方式快速 Review
- 优先保证核心链路
- 自动化测试不是银弹，重构不能完全依赖测试（毕竟你的测试代码也需要被测试）

<a name="9lsvK"></a>
## React 测试落地

现在我们来看一下如何针对 React 项目进行测试。通常，一个前端项目的测试要求包含：完备的**单元测试**、**组件测试**、**端到端测试**能力。落地到 React 项目的测试覆盖面如下：

- 最小化单元测试，如基础类方法、utils 工具库等
- Redux actions、reducers、effects 测试
- React 组件测试
- 端内测试（考虑到后端可能没有全流程的沙箱链路，所以使用 mock 数据测试）

所需的最小工具集为：

- Test Runner，用于测试策略的组织描述，生成报告等
- 断言，用于判断测试结果是否符合预期，根据给定的表达式的值为 true 或者 false，决定是否打印错误信息以及生成测试报告，在编程或者测试中都会用到
- 辅助工具，用于侵入运行时对象、库、类等，对测试过程有极大帮助
- React 组件测试工具
- 无头浏览器，用于贴近真实环境的端内测试
- 其他如测试覆盖率工具等

<a name="4wC0o"></a>
### 工具对比

各类 Test Runner 和断言工具，差别不是很大，都能满足需求；<br />React 组件测试目前除了 Enzyme 没找到类似的工具；<br />无头浏览器有 Puppeteer 和 Selenium，前者比较轻量，API 简洁且功能强大，后者可测试多浏览器，不过要想覆盖到尽可能多的容器，需要在 Windows 中部署（e.g. IE），目前看来前者能较好满足基本需求，PhantomJS 不再维护，暂不考虑；<br />因为集成方案中，也是对这些工具的集成，一些增强的功能暂时不是强诉求。考虑通用性，轻量和灵活度，目前个人考虑是不用集成方案，而是使用自由组合的方式；

<a name="3ENHA"></a>
### 自选方案
在对比了各个集成方案后，我选择了 Mocha、Chai、jsdom、Enzyme、Sinon、Puppeteer 作为测试方案，以下是主观对比：

|  | **Macaca** | **Cypress** | **CasperJS** | **Jest** | **Nightwatch** | **自选方案** |
| --- | :---: | :---: | :---: | :---: | :---: | :---: |
| 跨端测试 | 支持 | 支持 | 不支持 | 自选 | 支持 | 不支持 |
| 测试脚本录制 | 支持 | 支持 | 不支持 | 自选 | 支持 | 支持 |
| 文档完善 | 一般 | 好 | 好 | 好 | 好 | 好 |
| 丰富的错误报告 | 好 | 好 | 一般 | 好（三方） | 好（三方） | 好（三方） |
| 扩展性 | 中 | 好 | 中 | 中 | 好 | 好 |
| 并发测试 | 不支持 | 支持 | 不支持 | 支持 | 支持、若使用 Mocha 则不支持 | 不支持 |
| 特色功能 | 支持客户端 | 丰富的 Dashboard、<br />逐测试调试 |  |  |  |  |  |

建议：编写待测试的代码时，尽量符合 SOLID 原则，不要直接依赖浏览器环境，便于在 Node.js 环境中直接测试。同时，考虑到在代码中进行单元测试、组件测试，对浏览器环境难免有要求，比如三方库需要访问 window、document、cookie、宿主类或接口，加载外部脚本等。所以测试时可以考虑使用 jsdom 内置浏览器对象到 global（比如使用 [jsdom-global](https://github.com/rstacruz/jsdom-global)），或者将代码构建后，在浏览器中测试，Mocha 等 Test Runner 都支持在浏览器中执行测试。

<a name="xscDr"></a>
### 单元测试

准备工作：因为涉及到 ES6 和 JSX 语法，请先加载 Require Hook：@babel/register 以动态编译不支持的语法。同时，IDE 的 debugger 能力有助于我们更高效地测试，需加以利用。

接下来我们以 [DvaJS](https://dvajs.com/) 项目为例，从单元测试开始，逐步覆盖各测试切面。如以下例子通过 Sinon 对方法进行 wrap：

```javascript
'should call method once with argument': function () {
  var object = { method: function () {} };
  var spy = sinon.spy(object, 'method');

  object.method(1);

  assert(spy.withArgs(1).calledOnce);
}
```


测试 effects（这里使用了 Redux 推荐的 [runSage](https://redux-saga.js.org/docs/api/#runsagaoptions-saga-args) 来一次性跑完 effects）：

```javascript
import { expect } from 'chai';
import { runSaga, effects } from 'dva/saga';

describe('Account Manage', function() {
  describe('info', function() {
    const {
      state,
      effects: {
        edit
      }
    } = require('../src/account/models/info');

    it('should dispatch saveInfo action when editing', async function() {
      const dispatched = [];
      const payload = { username: 'name' };
      const result = await runSaga({
        dispatch: (action) => dispatched.push(action),
        getState: () => state
      }, edit, { payload }, effects).done;

      expect(dispatched).to.have.lengthOf(1);
      expect(dispatched[0]).to.have.property('type', 'saveInfo');
    });
  });
});
```


<a name="yqDOZ"></a>
### 组件测试

Enzyme 使用虚拟浏览器技术，可以以不同的渲染方式测试你的组件：

- shallow，只渲染当前层组件，子组件不会被渲染，其会调用部分周期方法，不会实际地渲染节点，适用于只测试当前组件的输入输出
- mount，渲染高阶组件，包含整个组件树，这需要 DOM APIs（至少看起来像，如 jsdom 环境）
- static，静态渲染组件，输出 HTML 并使用文档树解析工具 Cheerio 包裹

你可以很方便地使用 jQuery 风格的 selectors 选择节点，同时，[chai-enzyme](https://github.com/producthunt/chai-enzyme) 可赋予 Chai 更多基于 Enzyme 的断言特性。

```javascript
import { expect } from 'chai';
import React from 'react';
import { mount } from 'enzyme';
import { effects } from 'dva/saga';

const { put } = effects;

describe('Banner', function() {
  const Banner = require('../src/components/Banner');

  it('should render correctly', async function() {
    const wrapper = mount(<Banner dispatch={put}/>);
    // wait async request
    await new Promise((resolve) => setTimeout(resolve, 2000));

    expect(wrapper.state('bannerData')).to.have.lengthOf.at.least(1);
    expect(wrapper.find('.slick-list')).to.have.lengthOf.above(1);
	});
});
```


<a name="0C7AS"></a>
### E2E 测试

使用无头浏览器模拟用户的真实操作：

```javascript
// launch server
import ready from '../../server';
import { expect } from 'chai';
import puppeteer from 'puppeteer';

describe('Account', function() {
  // set a long timeout
  this.timeout(60000);

  describe('log in', function() {
    it('should log in correctly', async function() {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      // wait dev server ready
      await ready();
      await page.goto('http://localhost:8000/account/login', { 'waitUntil': 'networkidle0' });
	    await page.type('#username', 'smalldragonluo');
	    await page.type('#password', 'pwd');
	    await page.click('#submit');
			// ...
      const result = await page.$eval('#result', (element) => {
        return element.innerHTML
      })
      expect(result).to.equal('Success!');
      
      await browser.close();
    });
  });
});
```


<a name="4MLbN"></a>
## 附：前端测试工具

此部分主要分析了当前热门的前端测试工具，供选型时参考

<a name="N0sfa"></a>
### 测试框架（Test Runner）

[**Mocha**](https://mochajs.org/)

拥有丰富特性的测试框架，不同于其他大而全的测试产品，其专注于测试策略的组织，可以和众多测试工具结合使用<br />特点

- 异步 Hooks 支持
- 详细的测试报告，包括测试覆盖率，diff 等
- timeout、全局变量泄露检测、慢测试追踪、retry 等支持

demo

```javascript
describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});
```


[**Jasmine**](https://jasmine.github.io/index.html)

一个类似 Mocha 的测试框架，支持 Node.js、Ruby、Python<br />特点

- 内置测试框架、断言
- 并行测试、异步支持
- 也包含 Function Mock、Timer Mock、XHR Mock 等工具库能力（类似部分 Sinon 功能）

demo

```javascript
describe("A suite", function() {
  it("contains spec with an expectation", function() {
    expect(true).toBe(true);
  });
});
```

<a name="67920e82"></a>
### 断言

**console**

宿主内置的 console 对象自带简单的 assert 断言

demo

```javascript
console.assert(typeof a === 'string', 'a should be string');
  // Assertion failed: a should be string
```


**assert**

Node.js 内置模块，提供较丰富的断言方法，可自定义断言错误

demo

```javascript
const assert = require('assert');

assert(typeof a === 'string', 'a should be string');
// AssertionError [ERR_ASSERTION]: a should be string

assert.deepEqual(obj, obj2, 'obj should deeply equal to obj2')
// AssertionError [ERR_ASSERTION]: obj should deeply equal to obj2
```


[**Chai**](https://www.chaijs.com/)

Chai 是一个 BDD / TDD 断言库，支持 assert、should、expect 风格的编写模式

demo

```javascript
// BDD - should
foo.should.be.a('string');
foo.should.equal('bar');
foo.should.have.lengthOf(3);
tea.should.have.property('flavors').with.lengthOf(3);

// BDD - expect
expect(foo).to.be.a('string');
expect(foo).to.equal('bar');
expect(foo).to.have.lengthOf(3);
expect(tea).to.have.property('flavors').with.lengthOf(3);

// TDD - assert, more classic
assert.typeOf(foo, 'string');
assert.equal(foo, 'bar');
assert.lengthOf(foo, 3)
assert.property(tea, 'flavors');
assert.lengthOf(tea.flavors, 3);
```

<a name="de33723f"></a>
### 工具库

[**Sinon.JS**](https://sinonjs.org/)

一个提供对方法进行伪造、劫持和结果收集等功能的工具库，也能对一些运行时的方法进行替换（如替换 setTimeout 加速延迟等测试场景）、伪造 XHR 和 HTTP Response 等。几乎能模拟任何你需要覆盖的逻辑，可独立于各类测试工具使用

示例：fake 的使用

```javascript
"test should call all subscribers, even if there are exceptions" : function() {
  var message = 'an example message';
  var stub = sinon.stub().throws();
  var spy1 = sinon.spy();

  PubSub.subscribe(message, stub);
  PubSub.subscribe(message, spy1);

  PubSub.publishSync(message, undefined);

  assert(spy1.called);
  assert(stub.calledBefore(spy1));
}
```


[**Enzyme**](https://airbnb.io/enzyme/)

Airbnb 出品的 React 组件测试工具，可以方便地测试组件输出，遍历、操作 React Tree。对于测试 React 组件的场景能很好满足（如果对测试环境有更多要求，例如需要支持界面渲染，触发 resize、拖拽等复杂事件，请选择端到端测试工具）

特点

- jQuery 风格 API
- 提供 setProps、setState、setContext 等 React 模型内方法，以及 click、type 等事件模拟
- 支持渲染静态 HTML、shallow（虚拟的 React Tree，会调用生命周期方法，不能测试子组件）、基于 jsdom 的无头浏览器 DOM 渲染

demo

```javascript
describe('<MyComponent />', () => {
  it('renders children when passed in', () => {
    const wrapper = shallow((
      <MyComponent>
        <div className="unique" />
      </MyComponent>
    ));
    expect(wrapper.contains(<div className="unique" />)).to.equal(true);
  });

  it('simulates click events', () => {
    const onButtonClick = sinon.spy();
    const wrapper = shallow(<Foo onButtonClick={onButtonClick} />);
    wrapper.find('button').simulate('click');
    expect(onButtonClick).to.have.property('callCount', 1);
  });
});
```

<a name="40eed477"></a>
### Headless 容器

[**Puppeteer**](https://pptr.dev/)

Google 开源的基于 Node.js 的浏览器高级 API 工具库，能通过 DevTools Protocol 控制浏览器行为，拥有几乎完整的特性，用于端到端测试。不足之处是接口设计可能不够友好

特点

- Promise 风格异步接口
- 强大、贴近真实的测试环境
- 可切换 headless 和 non-headless 模式
- Chrome Extension 测试

demo

```javascript
puppeteer.launch().then(async browser => {
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await page.screenshot({path: 'screenshot.png'});
  const divsCounts = await page.$$eval('div', divs => divs.length);
  await browser.close();
});
```


[**Selenium**](https://www.seleniumhq.org/)

和 Puppeteer 一样，都是控制浏览器行为的工具库，但实现上采用 Web Driver 接口协议，用户可以通过 Selenium 封装的 API 使用更多容器（Web Driver）

特点

- 多浏览器支持，如 Chrome、IE（7/8/9/10/11，但需要 Windows）、FireFox、Safari、Opera、HtmlUnit、PhantomJS、Android (with Selendroid or appium)、iOS (with ios-driver or appium)
- Selenium IDE 支持录制自动化脚本（Chrome and Firefox）
- Selenium RC 可远程控制
- 支持 Java、C#、Python、Ruby、Perl、PHP、JavaScript

demo

```javascript
var driver = new webdriver.Builder().build();
driver.get('http://www.google.com');

var element = driver.findElement(webdriver.By.name('q'));
element.sendKeys('Cheese!');
element.submit();

driver.getTitle().then(function(title) {
  console.log('Page title is: ' + title);
});

driver.wait(function() {
  return driver.getTitle().then(function(title) {
    return title.toLowerCase().lastIndexOf('cheese!', 0) === 0;
  });
}, 3000);

driver.getTitle().then(function(title) {
  console.log('Page title is: ' + title);
});

driver.quit();
```

<a name="dd666972"></a>
### 
<a name="UgFh8"></a>
### 集成方案

[**CasperJS**](http://casperjs.org/)

一个端到端测试工具（基于 PhantomJS/SlimerJS），集成基础的测试框架，底层使用 Python 实现，但可以和 npm 工具链使用，支持 CoffeeScript

```javascript
casper.test.begin('Hello, Test!', 1, function(test) {
  casper.start('http://casperjs.org/');
  casper.then(function() {
      this.echo('First Page: ' + this.getTitle());
      test.assert(true);
      test.done();
  });
  casper.run();
});
```

以及 TDD 风格的断言，如：

- assertExists()
- assertFalsy()
- assertFieldCSS()
- assertHttpStatus()


[**Macaca**](https://macacajs.github.io/zh/)

Macaca 是阿里巴巴开源的自动化端到端测试方案，可通过集成 Macaca 生态中的各种工具进行测试（可自行选择测试框架和断言）

特点

- 基于 WebDriver 标准的多端 UI 测试，涵盖 iOS、安卓和 Web（Selenium）
- 视频录制，生成详细报告等
- 强大的数据 Mock（DataHub），支持场景切换、schema 接口描述、自动生成接口文档、快照录入，能和 webpack 整合使用

demo

```javascript
var remoteConfig = {
  host: 'localhost',
  port: 3456 // Macaca server defaults to using port 3456
};

before(function() {
  return driver.init({
    platformName: 'desktop', // iOS, Android, Desktop
    browserName: 'chrome'    // Chrome, Electron
    app: path/to/app         // Only for mobile
  });
});

after(function() {
  return driver
    .sleep(1000)
    .quit();
});

it('#1 should', function() {
  // ...
});
```


[**Cypress**](https://www.cypress.io/)

一个完备的测试工具（All-in-one testing framework），覆盖单元测试、集成测试、端到端测试。包含测试框架、断言（should 风格）、端到端测试 API、记录和展示测试报告的 Dashboard 云服务等，自称 Next Generation Test Tool

特点

- 记录每个测试步骤，并支持回溯
- debug 友好
- 网络延迟控制
- 截图和视频记录
- 集成 sinon、lolex、sinon-chai
- 类似 jQuery 的 API 风格设计，如：`$('.xx').doSth().doElse();`
- 插件机制扩展
- 并行测试
- 对测试记录（ `it()` ）有 500 个的限制，超出将收费

demo

```javascript
describe('My First Test', function() {
  it('Gets, types and asserts', function() {
    cy.visit('https://example.cypress.io');

    cy.contains('type').click();

    // Should be on a new URL which includes '/commands/actions'
    cy.url().should('include', '/commands/actions');

    // Get an input, type into it and verify that the value has been updated
    cy.get('.action-email')
      .type('fake@email.com')
      .should('have.value', 'fake@email.com');
  });
})
```


[**Jest**](https://jestjs.io/)

Facebook 开源的集成测试框架，功能也十分强大，内置 Jasmine，Istanbul 等能力

特点

- 基于 snapshot 的 React 渲染结果测试（因为 snapshot 常会因任何前端改动而改变，相比于 enzyme 不够灵活，不过本身 enzyme 支持 Jest）
- 类似 Sinon 等工具库
- 内置 jsdom，可以执行脚本、操作 DOM
- 精确到行的命令行异常提示
- 支持覆盖率测试

demo

```javascript
it('renders correctly', () => {
  const tree = renderer
    .create(<Link page="https://prettier.io">Prettier</Link>)
    .toJSON();
  expect(tree).toMatchInlineSnapshot(`
    <a
      className="normal"
      href="https://prettier.io"
      onMouseEnter={[Function]}
      onMouseLeave={[Function]}
    >
      Prettier
    </a>
  `);
});
```


[**Nightwatch**](http://nightwatchjs.org/)

一个集成的端到端测试解决方案，基于 WebDriver 标准（Selenium），内置 Mocha、Chai，暂不支持测试覆盖率报告

特点

- 友好的浏览器控制接口
- 易于接入集成测试环境
- 易于扩展
- 提供云服务
- 支持并行测试

demo

```javascript
module.exports = {
  'Demo test Google' : function (client) {
    client
      .url('http://www.google.com')
      .waitForElementVisible('body', 1000)
      .assert.title('Google')
      .assert.visible('input[type=text]')
      .setValue('input[type=text]', 'rembrandt van rijn')
      .waitForElementVisible('button[name=btnG]', 1000)
      .click('button[name=btnG]')
      .pause(1000)
      .assert.containsText('ol#rso li:first-child',
        'Rembrandt - Wikipedia')
      .end();
  }
};
```


<a name="VS2oj"></a>
## 参考资料

- [React 单元测试策略及落地](https://blog.linesh.tw/#/post/2018-07-13-react-unit-testing-strategy)
- [Just Say No to More End-to-End Tests](https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html)
- [单元测试 - 维基百科](https://zh.wikipedia.org/wiki/%E5%8D%95%E5%85%83%E6%B5%8B%E8%AF%95)
- [React 项目 的 UI 测试](https://segmentfault.com/a/1190000015020626)
