// @flow

export function handleError(handler: Function): Function {
  return async function(req, res, next) {
    try {
      let result = await handler(req, res, next)
      res.json(result)
    } catch (e) {
      console.error('error doing stuff', e.stack || e)
      res.status(500).json({error: e.stack || e})
    }
  }
}
