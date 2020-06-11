import { Octokit } from "../src";

const pluginFoo = () => {
  return { foo: "bar" };
};
const pluginBaz = () => {
  return { baz: "daz" };
};
const pluginQaz = () => {
  return { qaz: "naz" };
};

describe("Octokit.plugin()", () => {
  it("gets called in constructor", () => {
    const MyOctokit = Octokit.plugin(pluginFoo);
    const myClient = new MyOctokit();
    expect(myClient.foo).toEqual("bar");
  });

  it("supports multiple plugins", () => {
    const MyOctokit = Octokit.plugin(pluginFoo, pluginBaz, pluginQaz);
    const myClient = new MyOctokit();
    expect(myClient.foo).toEqual("bar");
    expect(myClient.baz).toEqual("daz");
    expect(myClient.qaz).toEqual("naz");
  });
  it("does not override plugins of original constructor", () => {
    const MyOctokit = Octokit.plugin(pluginFoo);
    const myClient = new MyOctokit();
    expect(myClient.foo).toEqual("bar");
    const octokit = new Octokit();
    expect(octokit).not.toHaveProperty("foo");
  });

  it("receives client options", () => {
    const MyOctokit = Octokit.plugin((octokit, options) => {
      expect(options).toStrictEqual({
        foo: "bar",
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
        customKey: true,
      };
    };
    const MyOctokit = Octokit.plugin(myPlugin).plugin(myPlugin);
    expect(() => new MyOctokit()).not.toThrow();
  });

  it("supports chaining", () => {
    const MyOctokit = Octokit.plugin(pluginFoo)
      .plugin(pluginBaz)
      .plugin(pluginQaz);

    const myClient = new MyOctokit();
    expect(myClient.foo).toEqual("bar");
    expect(myClient.baz).toEqual("daz");
    expect(myClient.qaz).toEqual("naz");
  });
});
