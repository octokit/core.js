import { Octokit } from "../src";

describe("Octokit.plugin()", () => {
  it("gets called in constructor", () => {
    const MyOctokit = Octokit.plugin(() => {
      return {
        foo: "bar"
      };
    });
    const myClient = new MyOctokit();
    expect(myClient.foo).toEqual("bar");
  });

  it("supports array of plugins", () => {
    const MyOctokit = Octokit.plugin([
      () => {
        return {
          foo: "bar"
        };
      },
      () => {
        return { baz: "daz" };
      }
    ]);
    const myClient = new MyOctokit();
    expect(myClient.foo).toEqual("bar");
    expect(myClient.baz).toEqual("daz");
  });

  it("does not override plugins of original constructor", () => {
    const MyOctokit = Octokit.plugin(octokit => {
      return {
        foo: "bar"
      };
    });
    const myClient = new MyOctokit();
    expect(myClient.foo).toEqual("bar");

    const octokit = new Octokit();
    expect(octokit).not.toHaveProperty("foo");
  });

  it("receives client options", () => {
    const MyOctokit = Octokit.plugin((octokit, options) => {
      expect(options).toStrictEqual({
        foo: "bar"
      });
    });
    new MyOctokit({ foo: "bar" });
  });

  it("does not load the same plugin more than once", () => {
    const myPlugin = (octokit: Octokit) => {
      if ("customKey" in octokit) {
        throw new Error("Boom!");
      }

      return {
        customKey: true
      };
    };
    const MyOctokit = Octokit.plugin(myPlugin).plugin(myPlugin);
    expect(() => new MyOctokit()).not.toThrow();
  });

  it("supports chaining", () => {
    const MyOctokit = Octokit.plugin(() => {
      return {
        foo: "bar"
      };
    })
      .plugin(() => {
        return { baz: "daz" };
      })
      .plugin(() => {
        return { qaz: "naz" };
      });

    const myClient = new MyOctokit();
    expect(myClient.foo).toEqual("bar");
    expect(myClient.baz).toEqual("daz");
    expect(myClient.qaz).toEqual("naz");
  });
});
