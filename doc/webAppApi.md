#webApp接口摘要

##stock

 * 根据买卖时间以及量计算收益(post): **/stock/calculateProfit/:stockCode**

 * 使用趋势追踪获取股票买卖点(post): **/stock/followTrendOperateInfo/:stockCode**
 
 * 使用趋势追踪获取股票买卖点并计算收益(get): **/stock/followTrend/:stockCode**
 
 * 添加股票到自选之中(get): **/stock/addStock2Pool/:stockCode**

 * 增加股票成交记录(get): **/stock/addTrendHistory/:stockCode**

 * 获取所有股票的公司代码对应的公司名称(get): **/stock/marketCompanyCode2Name**

 * 用户的关注股票(get): **/stock/userFavoriteData/:username**

 * 添加用户关注股票(post): **/stock/addUserFavorite**

 * 删除用户关注股票(post): **/stock/deleteUserFavorite**

 * 移动用户关注股票顺序(post): **/stock/moveUserFavorite**

##image
 * 获取随机图片的url(get): **/image/randomUrl**