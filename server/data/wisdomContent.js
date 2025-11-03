// 哲理内容数据库 - 按类别分类
const wisdomContent = {
  '成长启发': [
    {
      philosophy: "每一次新的开始，都蕴含着无限的可能性。",
      suggestion: "主动学习一项新技能，拓展自己的视野。"
    },
    {
      philosophy: "知识的火花能点燃内心的热情之火。",
      suggestion: "花时间阅读一本有启发性的书籍。"
    },
    {
      philosophy: "成长不是等待暴风雨过去，而是学会在雨中跳舞。",
      suggestion: "尝试从困难中寻找学习和成长的机会。"
    },
    {
      philosophy: "今天的每一步都是明天梦想的基石。",
      suggestion: "设定一个短期目标并开始行动。"
    },
    {
      philosophy: "好奇心是智慧的种子，行动是成长的肥料。",
      suggestion: "探索一个你一直感兴趣的新领域。"
    }
  ],

  '转化积淀': [
    {
      philosophy: "经历如水，能洗净浮躁，沉淀智慧。",
      suggestion: "花时间反思最近的经历，记录下心得体会。"
    },
    {
      philosophy: "所有的过往都是未来的序章，值得用心珍藏。",
      suggestion: "整理过去的照片或信件，回忆美好时光。"
    },
    {
      philosophy: "时间是最好的酿酒师，会让经历变得更加醇香。",
      suggestion: "给一些重要决定留出思考的时间。"
    },
    {
      philosophy: "在变化中寻找不变，在动荡中保持定力。",
      suggestion: "建立自己的核心价值观和生活原则。"
    },
    {
      philosophy: "每一个结束都是新开始的铺垫。",
      suggestion: "为完成的任务做一个简单的总结。"
    }
  ],

  '孕育收获': [
    {
      philosophy: "耐心耕耘，时光会给你最好的回报。",
      suggestion: "坚持一个好习惯，哪怕每天只有微小进步。"
    },
    {
      philosophy: "播种希望，收获未来；播种善良，收获温暖。",
      suggestion: "对身边的人做一件善意的小事。"
    },
    {
      philosophy: "努力的过程本身就是一种收获。",
      suggestion: "专注于当前任务的每个细节，享受过程。"
    },
    {
      philosophy: "每一颗种子都有开花的力量，只需要时间和耐心。",
      suggestion: "继续坚持你现在在做的重要事情。"
    },
    {
      philosophy: "收获的季节总是留给坚持到最后的人。",
      suggestion: "不轻言放弃，再坚持一下。"
    }
  ],

  '净化流动': [
    {
      philosophy: "心若如水，便能容纳万物；心若清澈，便能照见真理。",
      suggestion: "找个安静的地方深呼吸，清空思绪。"
    },
    {
      philosophy: "放下过去的包袱，才能轻装前行。",
      suggestion: "整理一件你一直拖延的事情。"
    },
    {
      philosophy: "变化是生命的常态，适应是智慧的表现。",
      suggestion: "接受一个你无法改变的事实。"
    },
    {
      philosophy: "流水不腐，户枢不蠹，生命在于流动。",
      suggestion: "出门散步，感受自然的流动。"
    },
    {
      philosophy: "清空杂念，才能听到内心的声音。",
      suggestion: "花十分钟冥想或静坐。"
    }
  ],

  '滋养生长': [
    {
      philosophy: "内在的丰盈胜过外在的繁华。",
      suggestion: "关注自己的身心健康，好好休息。"
    },
    {
      philosophy: "给心灵补充营养，让它开出智慧之花。",
      suggestion: "做一件让自己感到快乐和满足的事。"
    },
    {
      philosophy: "每一次的自我投资，都是对未来最好的礼物。",
      suggestion: "投资于自己的学习和成长。"
    },
    {
      philosophy: "温柔地对待自己，就像对待最好的朋友。",
      suggestion: "给自己一些鼓励和肯定。"
    },
    {
      philosophy: "根深才能叶茂，内养才能外显。",
      suggestion: "培养一个能丰富内在世界的爱好。"
    }
  ],

  '突破变革': [
    {
      philosophy: "跳出舒适区，才能看到更广阔的世界。",
      suggestion: "尝试一种全新的做事方式。"
    },
    {
      philosophy: "改变不是威胁，而是成长的机遇。",
      suggestion: "主动寻找一个可以改进的地方。"
    },
    {
      philosophy: "勇气不是不害怕，而是害怕依然前行。",
      suggestion: "面对一个让你有点恐惧的挑战。"
    },
    {
      philosophy: "创新是在已知的基础上勇敢地走向未知。",
      suggestion: "用创新的方法解决一个老问题。"
    },
    {
      philosophy: "真正的改变从内心的决定开始。",
      suggestion: "下定决心做一个积极的改变。"
    }
  ],

  '稳固引导': [
    {
      philosophy: "稳扎稳打，方能行稳致远。",
      suggestion: "为自己制定一个清晰的计划。"
    },
    {
      philosophy: "方向比速度更重要，慢下来有时反而更快。",
      suggestion: "重新评估你的目标和方向。"
    },
    {
      philosophy: "内心的指南针永远不会迷失方向。",
      suggestion: "倾听你的直觉，相信自己的判断。"
    },
    {
      philosophy: "坚实的基础是支撑梦想的柱子。",
      suggestion: "专注于打好基础，不要急于求成。"
    },
    {
      philosophy: "在不确定中寻找确定，在变化中保持初心。",
      suggestion: "回到最初的动机，提醒自己为什么开始。"
    }
  ],

  '冷静调和': [
    {
      philosophy: "在喧嚣中保持宁静，在繁忙中保持从容。",
      suggestion: "做几次深呼吸，让心情平静下来。"
    },
    {
      philosophy: "理性是智慧的舵手，感性是前进的动力。",
      suggestion: "在做决定前，给情绪一些时间平复。"
    },
    {
      philosophy: "平衡是生活的艺术，适度是智慧的表现。",
      suggestion: "在工作与休息之间找到平衡点。"
    },
    {
      philosophy: "内心的平静胜过外界的掌声。",
      suggestion: "减少一些不必要的社交活动。"
    },
    {
      philosophy: "和谐来自于内心的统一，而非外界的认同。",
      suggestion: "做一些能让你内心感到和谐的事情。"
    }
  ],

  '重塑锤炼': [
    {
      philosophy: "每一次挫折都是成长的锤炼，每一次失败都是成功的垫脚石。",
      suggestion: "从失败中学习，重新站起来。"
    },
    {
      philosophy: "真正的强大不是永不倒下，而是每次倒下后都能重新站起。",
      suggestion: "坚持锻炼身体，增强意志力。"
    },
    {
      philosophy: "精雕细琢方成大器，千锤百炼始得真金。",
      suggestion: "对现有的技能进行精进的练习。"
    },
    {
      philosophy: "改变自己，比改变世界更容易，也更有意义。",
      suggestion: "审视并改进自己的一个缺点。"
    },
    {
      philosophy: "压力能变成动力，挑战能变成机遇。",
      suggestion: "把当前的压力转化为行动的力量。"
    }
  ],

  '修剪聚焦': [
    {
      philosophy: "少即是多，专注才能深入，简单才能高效。",
      suggestion: "减少一项不必要的活动或承诺。"
    },
    {
      philosophy: "去除枝叶的繁茂，才能看到主干的方向。",
      suggestion: "明确当前最重要的三件事。"
    },
    {
      philosophy: "专注当下，才能创造有意义的未来。",
      suggestion: "全心投入地做一件事。"
    },
    {
      philosophy: "精简生活，丰富内心，减少物质，增加精神。",
      suggestion: "整理一个空间，让环境更简洁。"
    },
    {
      philosophy: "真正的智慧在于知道什么不重要。",
      suggestion: "学会说'不'，保护自己的时间和精力。"
    }
  ],

  '当下接受': [
    {
      philosophy: "宇宙给你的，正是你此刻需要的。",
      suggestion: "相信当下的建议，静心体会它的深意。"
    },
    {
      philosophy: "答案不在下一个页面，而在你此刻的领悟中。",
      suggestion: "停止寻找，开始感受已经得到的启示。"
    },
    {
      philosophy: "真正的智慧，是学会接受第一个答案。",
      suggestion: "给自己时间，让这些建议在心中生根发芽。"
    },
    {
      philosophy: "你寻找的越多，反而离答案越远。",
      suggestion: "停下来，专注于眼前的这一条建议。"
    },
    {
      philosophy: "每一次刷新，都是对当下指导的不信任。",
      suggestion: "相信第一次看到的建议，它就是为你准备的。"
    },
    {
      philosophy: "最好的答案，往往是最简单的那一个。",
      suggestion: "不要过度思考，相信直觉给你的第一个答案。"
    },
    {
      philosophy: "改变世界的不是寻找答案，而是践行已有的答案。",
      suggestion: "将现在看到的建议转化为实际行动。"
    },
    {
      philosophy: "内心的平静，来自于对当下的完全接受。",
      suggestion: "放下寻找完美答案的执念，接受当下的指导。"
    },
    {
      philosophy: "机会往往伪装成平凡的建议出现。",
      suggestion: "仔细品味现在看到的建议，它可能隐藏着重要信息。"
    },
    {
      philosophy: "相信宇宙的安排，它给你的就是最适合你的。",
      suggestion: "感恩此刻得到的建议，它是宇宙给你的礼物。"
    }
  ]
};

// 获取特定类别的内容
function getContentByCategory(category) {
  return wisdomContent[category] || [];
}

// 随机选择一个内容
function getRandomContent(category, seed) {
  const contents = getContentByCategory(category);
  if (contents.length === 0) {
    return null;
  }

  // 基于种子的伪随机选择（使用简单的哈希函数）
  const hash = (seed) => {
    let h = 0;
    for (let i = 0; i < seed.toString().length; i++) {
      h = ((h << 5) - h) + seed.toString().charCodeAt(i);
      h = h & h; // 转换为32位整数
    }
    return Math.abs(h);
  };

  const hashValue = hash(seed);
  const index = hashValue % contents.length;
  return contents[index];
}

module.exports = { wisdomContent, getContentByCategory, getRandomContent };