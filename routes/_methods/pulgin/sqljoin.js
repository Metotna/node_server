var sqlJoin = (function() {
	var whereResolve = function(type, whereSwitch) {
		if (whereSwitch.where) {
			type += " WHERE ";
		}
		var keyAry = (whereSwitch && whereSwitch.whereProp) ? whereSwitch.whereProp : [];
		if (keyAry.length) {

			for (let i = 0; i < keyAry.length; i++) {
				let c = keyAry[i];
				if (typeof c == "object") {
					for (var key in c) {
						if (key !== "operator") type += "`" + key + "`" + (c["operator"] ? c["operator"] : "=") + "" + "'" + c[key] + "'";
					}
				} else if (/(AND)?(OR)?/.test(c)) {
					type += " " + c + " ";
				} else if (/(\()?(\))?/.test(c)) {
					type += c;
				}
			}
		}
		var likeKeyArr = whereSwitch.likeProp ? Object.keys(whereSwitch.likeProp) : [];
		if (likeKeyArr.length) {
			if (likeKeyArr.length > 1) {
				for (let j = 0; j < likeKeyArr.length; j++) {
					let cur = likeKeyArr[j];
					if (j === likeKeyArr.length - 1) {
						type += cur + " LIKE " + "'%" + whereSwitch.likeProp[cur] + "%'";
					} else {
						type += cur + " LIKE " + "'%" + whereSwitch.likeProp[cur] + "%'" + " AND ";
					}
				}
			} else {
				for (let key in whereSwitch.likeProp) {
					type += key + " LIKE " + "'%" + whereSwitch.likeProp[key] + "%'";
				}
			}
		}
		return type;
	};
	/**
   * @param sqlType Object query type-> 'INSERT' 'DELETE' 'UPDATE' 'SELECT'
   * @param tableName String the name of the enqueried table
   * @param whereSwitch [,Object] config the WHERE sentence
   * @param limitSwitch [,Object] config the LIMIT sentence
   * @returns String the sql query string joined by sqlJoin function
   **/
	return (sqlType, tableName, whereSwitch, limitSwitch)=> {
		let cur;
		var SELECT = "",
			DELETE = "";
		switch (sqlType.type) {
		case "SELECT":
			SELECT = "SELECT ";
			if (sqlType.distinct) {
				SELECT += " DISTINCT ";
			}
			sqlType.prop = sqlType.prop ? sqlType.prop : [];
			if (sqlType.prop && sqlType.prop.length) {
				for (let i = 0; i < sqlType.prop.length; i++) {
					cur = sqlType.prop[i];
					if (i === sqlType.prop.length - 1) {
						SELECT += "`" + cur + "`";
					} else {
						SELECT += "`" + cur + "`,";
					}
				}
			} else {
				SELECT += " *";
			}
			SELECT += " FROM " + "`" + tableName + "`";
			if (whereSwitch) {
				SELECT = whereResolve(SELECT, whereSwitch);
			}

			var orderArr = sqlType.orderProp ? Object.keys(sqlType.orderProp) : [];
			if (orderArr.length) {
				SELECT += " ORDER BY ";
				for (let m = 0; m < orderArr.length; m++) {
					let c = orderArr[m];
					if (m === orderArr.length - 1) {
						if (sqlType.orderProp[c]) {
							SELECT += c + " ASC";
						} else {
							SELECT += c + " DESC";
						}
					} else {
						if (sqlType.orderProp[c]) {
							SELECT += c + " ASC, ";
						} else {
							SELECT += c + " DESC, ";
						}
					}
				}
			}

			if (limitSwitch && limitSwitch.limit) {
				SELECT += " LIMIT " + limitSwitch.num;
			}

			break;
		case "UPDATE":
			UPDATE = "UPDATE ";
			UPDATE += tableName + " SET ";
			var updatekeys = Object.keys(sqlType.prop);
			for (let i = 0; i < updatekeys.length; i++) {
				cur = updatekeys[i];
				// console.log(sqlType.prop[cur])
				if (sqlType.prop[cur]&& typeof(sqlType.prop[cur])=="string") {
					sqlType.prop[cur] = sqlType.prop[cur].replace(/'/g, "''");
				}
				if (i === updatekeys.length - 1) {

					UPDATE += "`" + cur + "` =" + "'" + sqlType.prop[cur] + "'";
				} else {
					UPDATE += "`" + cur + "` =" + "'" + sqlType.prop[cur] + "', ";
				}
			}
			if (whereSwitch && whereSwitch.where) {
				UPDATE = whereResolve(UPDATE, whereSwitch);
			}
			if (limitSwitch && limitSwitch.limit) {
				UPDATE += " LIMIT " + limitSwitch.num;
			}
			break;
		case "DELETE":
			DELETE = "DELETE FROM " + tableName;
			if (whereSwitch && whereSwitch.where) {
				DELETE = whereResolve(DELETE, whereSwitch);
			}
			if (limitSwitch && limitSwitch.limit) {
				DELETE += " LIMIT " + limitSwitch.num;
			}
			break;
		case "INSERT":
			INSERT = "INSERT INTO " + tableName;
			var insertProp = Object.keys(sqlType.prop);
			if (insertProp.length) {
				for (let i = 0, len = insertProp.length; i < len; i++) {
					cur = insertProp[i];
					if (len === 1) {
						INSERT += "(`" + cur + "`)";
						break;
					}
					if (i === 0) {
						INSERT += "(`" + cur;
					} else if (i === len - 1) {
						INSERT += "`,`" + cur + "`)";
					} else {
						INSERT += "`, `" + cur;
					}
				}
				INSERT += " VALUES ";
				for (let j = 0, leng = insertProp.length; j < leng; j++) {
					var curr = insertProp[j];
					if (sqlType.prop[curr] && typeof(sqlType.prop[curr])=="string") {
						sqlType.prop[curr] = sqlType.prop[curr].replace(/'/g, "''");
					}

					if (leng === 1) {
						INSERT += "('" + sqlType.prop[curr] + "')";
						break;
					}

					if (j === 0) {
						INSERT += "('" + sqlType.prop[curr];
					} else if (j === leng - 1) {
						INSERT += "','" + sqlType.prop[curr] + "')";
					} else {
						INSERT += "','" + sqlType.prop[curr];

					}
				}
			}
			break;
		}
		var UPDATE = UPDATE.replace(/'null'/g, null);
		var INSERT = INSERT.replace(/'null'/g, null);
		return { SELECT, UPDATE, DELETE, INSERT }[sqlType.type];
	};

})();
module.exports = sqlJoin;
