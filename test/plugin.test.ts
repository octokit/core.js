import { Octokit } from "../src";

describe("Octokit.plugin()", () => {
  it("gets called in constructor", () => {
    const MyOctokit = Octokit.plugin(octokit => {
      octokit.foo = "bar";
    });
    const myClient = new MyOctokit();
    expect(myClient.foo).toEqual("bar");
  });

  it("supports array of plugins", () => {
    const MyOctokit = Octokit.plugin([
      octokit => {
        octokit.foo = "bar";
      },
      octokit => {
        octokit.baz = "daz";
      }
    ]);
    const myClient = new MyOctokit();
    expect(myClient.foo).toEqual("bar");
    expect(myClient.baz).toEqual("daz");
  });

  it("does not override plugins of original constructor", () => {
    const MyOctokit = Octokit.plugin(octokit => {
      octokit.foo = "bar";
    });
    const myClient = new MyOctokit();
    expect(myClient.foo).toEqual("bar");

    const octokit = new Octokit();
    expect(octokit.foo).toEqual(undefined);
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
      if (octokit.customKey) {
        throw new Error("Boom!");
      } else {
        octokit.customKey = true;
      }
    };
    const MyOctokit = Octokit.plugin(myPlugin).plugin(myPlugin);
    expect(() => new MyOctokit()).not.toThrow();
  });
});
