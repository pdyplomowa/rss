const proxyquire = require('proxyquire').noCallThru();

let mockUrls = [];
let mockEmails = [];

class EmailEntityMock {
  save() {
    return new Promise(resolve => resolve())
  }
}

class UrlEntityMock {
  save() {
    return new Promise(resolve => resolve())
  }
}

const parserMock = {
  parseUrl(url) {
    return new Promise((resolve, reject) => {
      resolve({
        feedUrl: url,
        link: url,
        title: 'test',
        items: [],
      })
    })
  }
}

const modelsMock = {
  Url: {
    find() {
      return {
        exec() {
          return new Promise((resolve, reject) => {
            resolve(mockUrls);
          })
        }
      }
    },
    findOneAndRemove({ _id }) {
      return new Promise(resolve => resolve())
    }
  },
  Email: {
    find() {
      return {
        exec() {
          return new Promise((resolve, reject) => {
            resolve(mockEmails);
          })
        }
      }
    }
  },
  createEmail() {
    return new EmailEntityMock();
  },
  createUrl() {
    return new UrlEntityMock();
  }
}

const sgMailMock = {
  send(msg) {

  }
}

const api = proxyquire('../api', { './parser': parserMock, './models': modelsMock, '@sendgrid/mail': sgMailMock });

describe('api get', () => {
  let res;

  beforeEach(() => {
    res = { render() { } };
    mockUrls = [{ name: 'http://test1.com', name: 'http://test2.com' }];
    mockEmails = [{ name: 'example@mail.com' }];
  })

  it('should render index', async () => {
    spyOn(res, 'render').and.callFake((view) => {
      expect(view).toEqual('index');
    });
    await api.get(null, res);
  });

  it('should render urls', async () => {
    spyOn(res, 'render').and.callFake((view, { urls }) => {
      expect(urls).toEqual(mockUrls);
    });
    await api.get(null, res);
  });

  it('should render email', async () => {
    spyOn(res, 'render').and.callFake((view, { email }) => {
      expect(email).toEqual(mockEmails[0]);
    });
    await api.get(null, res);
  });

  it('should render emailView', async () => {
    spyOn(res, 'render').and.callFake((view, { urls, email, emailView }) => {
      urls.map((url) => expect(emailView.includes(url.name)).toBeTruthy());
      expect(emailView.includes(email))
    });
    await api.get(null, res);
  });
})

describe('api save', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {
        email: '',
        url: '',
      }
    }
    res = {
      redirect(url) {
      }
    }
  })

  it('should save email when no email', async () => {
    req.body.email = 'example@mail.com';
    mockEmails = [];
    spyOn(EmailEntityMock.prototype, 'save');
    await api.save(req, res);
    expect(EmailEntityMock.prototype.save).toHaveBeenCalled();
  })

  it('should not save email when there is email', async () => {
    req.body.email = 'example@mail.com';
    mockEmails = [{ name: 'example2@mail.com' }];
    spyOn(EmailEntityMock.prototype, 'save');
    await api.save(req, res);
    expect(EmailEntityMock.prototype.save).not.toHaveBeenCalled();
  });

  it('should save url', async () => {
    req.body.url = 'http://test.com';
    mockUrls = [];
    spyOn(UrlEntityMock.prototype, 'save');
    await api.save(req, res);
    expect(UrlEntityMock.prototype.save).toHaveBeenCalled();
  });

  it('should redirect', async () => {
    spyOn(res, 'redirect');
    await api.save(req, res);
    expect(res.redirect).toHaveBeenCalledWith('/')
  })
})

describe('api send', () => {
  let res;

  beforeEach(() => {
    res = {
      redirect(url) {

      }
    }
  })

  it('should send mail', async () => {
    mockUrls = [{ name: 'http://test1.com', name: 'http://test2.com' }];
    mockEmails = [{ name: 'example@mail.com' }];
    spyOn(sgMailMock, 'send').and.callFake((msg) => {
      expect(msg.to).toEqual(mockEmails[0].name);
      expect(msg.from).toEqual(mockEmails[0].name);
    })
    await api.send(null, res);
  });

  it('should redirect', async () => {
    spyOn(res, 'redirect')
    await api.send(null, res);
    expect(res.redirect).toHaveBeenCalledWith('/')
  });
})

describe('api deleteUrl', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        id: 10
      }
    }
    res = {
      redirect(url) {

      }
    }
  })

  it('should delete url', async () => {
    spyOn(modelsMock.Url, 'findOneAndRemove').and.callThrough();
    await api.deleteUrl(req, res)
    expect(modelsMock.Url.findOneAndRemove).toHaveBeenCalledWith({ _id: req.body.id });
  });

  it('should redirect', async () => {
    spyOn(res, 'redirect')
    await api.send(req, res);
    expect(res.redirect).toHaveBeenCalledWith('/')
  })
})