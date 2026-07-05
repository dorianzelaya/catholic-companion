export const MYSTERIES = {
  Joyful: {
    days: [1, 6], // Monday, Saturday
    mysteries: [
      {
        name: "The Annunciation",
        meditation: "The Angel Gabriel announces to Mary that she will conceive and bear the Son of God. Mary responds with total trust: 'Be it done unto me according to thy word.'"
      },
      {
        name: "The Visitation",
        meditation: "Mary visits her cousin Elizabeth, who is with child. At Mary's greeting, the infant John leaps in the womb, and Elizabeth proclaims: 'Blessed art thou among women.'"
      },
      {
        name: "The Nativity",
        meditation: "Jesus is born in a stable in Bethlehem, wrapped in swaddling clothes and laid in a manger. The angels announce peace on earth and good will to men."
      },
      {
        name: "The Presentation",
        meditation: "Mary and Joseph present the infant Jesus in the Temple. Simeon takes the child in his arms and prophesies that He will be a light to the nations."
      },
      {
        name: "The Finding in the Temple",
        meditation: "After three days of searching, Mary and Joseph find the twelve-year-old Jesus in the Temple, sitting among the teachers, listening and asking questions."
      }
    ]
  },
  Sorrowful: {
    days: [2, 5], // Tuesday, Friday
    mysteries: [
      {
        name: "The Agony in the Garden",
        meditation: "Jesus prays in the Garden of Gethsemane, his sweat falling like drops of blood. He accepts the Father's will: 'Not my will, but thine be done.'"
      },
      {
        name: "The Scourging at the Pillar",
        meditation: "Jesus is bound to a pillar and scourged. He endures this suffering in silence, offering it for the sins of the world."
      },
      {
        name: "The Crowning with Thorns",
        meditation: "Soldiers place a crown of thorns on Jesus' head and mock him as King of the Jews. He bears this humiliation with patience and love."
      },
      {
        name: "The Carrying of the Cross",
        meditation: "Jesus carries his cross through the streets of Jerusalem to Calvary, falling three times under its weight, meeting his Mother along the way."
      },
      {
        name: "The Crucifixion",
        meditation: "Jesus is nailed to the cross and dies after three hours of agony. His last words are: 'Father, into thy hands I commend my spirit.'"
      }
    ]
  },
  Glorious: {
    days: [3, 0], // Wednesday, Sunday
    mysteries: [
      {
        name: "The Resurrection",
        meditation: "On the third day, Jesus rises from the dead, conquering sin and death. Mary Magdalene is the first to encounter the Risen Lord at the empty tomb."
      },
      {
        name: "The Ascension",
        meditation: "Forty days after the Resurrection, Jesus ascends into heaven before the eyes of his disciples, promising to send the Holy Spirit."
      },
      {
        name: "The Descent of the Holy Spirit",
        meditation: "On Pentecost, the Holy Spirit descends upon Mary and the Apostles as tongues of fire. The Church is born and the Apostles go forth to preach."
      },
      {
        name: "The Assumption of Mary",
        meditation: "At the end of her earthly life, Mary is assumed body and soul into heavenly glory, a sign of the resurrection promised to all the faithful."
      },
      {
        name: "The Coronation of Mary",
        meditation: "Mary is crowned Queen of Heaven and Earth by her Son. She reigns as our Mother and Mediatrix, interceding for all her children."
      }
    ]
  },
  Luminous: {
    days: [4], // Thursday
    mysteries: [
      {
        name: "The Baptism of Jesus",
        meditation: "Jesus is baptized in the Jordan by John. The heavens open and the Father's voice is heard: 'This is my beloved Son, in whom I am well pleased.'"
      },
      {
        name: "The Wedding at Cana",
        meditation: "At Mary's intercession, Jesus performs his first miracle, turning water into wine. His disciples believe in him."
      },
      {
        name: "The Proclamation of the Kingdom",
        meditation: "Jesus proclaims the Kingdom of God, calls sinners to repentance, and forgives sins. He invites all to conversion of heart."
      },
      {
        name: "The Transfiguration",
        meditation: "On Mount Tabor, Jesus is transfigured before Peter, James, and John. His face shines like the sun and his garments become dazzling white."
      },
      {
        name: "The Institution of the Eucharist",
        meditation: "At the Last Supper, Jesus takes bread and wine and says: 'This is my body. This is my blood.' He gives himself completely as food for eternal life."
      }
    ]
  }
}

export const PRAYERS = {
  signOfCross: {
    name: "Sign of the Cross",
    text: "In the name of the Father, and of the Son, and of the Holy Ghost. Amen."
  },
  apostlesCreed: {
    name: "Apostles' Creed",
    text: "I believe in God, the Father Almighty, Creator of Heaven and earth; and in Jesus Christ, His only Son, Our Lord, Who was conceived by the Holy Ghost, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died, and was buried. He descended into Hell; the third day He arose again from the dead; He ascended into Heaven, sitteth at the right hand of God, the Father Almighty; from thence He shall come to judge the living and the dead. I believe in the Holy Ghost, the holy Catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen."
  },
  ourFather: {
    name: "Our Father",
    text: "Our Father, Who art in heaven, hallowed be Thy name; Thy kingdom come; Thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen."
  },
  hailMary: {
    name: "Hail Mary",
    text: "Hail Mary, full of grace, the Lord is with thee; blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen."
  },
  gloryBe: {
    name: "Glory Be",
    text: "Glory be to the Father, and to the Son, and to the Holy Ghost. As it was in the beginning, is now, and ever shall be, world without end. Amen."
  },
  fatimaPlayer: {
    name: "Fatima Prayer",
    text: "O my Jesus, forgive us our sins, save us from the fires of hell, lead all souls to Heaven, especially those most in need of Thy mercy. Amen."
  },
  hailHolyQueen: {
    name: "Hail Holy Queen",
    text: "Hail, Holy Queen, Mother of Mercy, our life, our sweetness and our hope. To thee do we cry, poor banished children of Eve. To thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us, and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary. Amen."
  }
}

export function getTodaysMysteries() {
  const day = new Date().getDay() // 0 = Sunday, 1 = Monday, etc.
  for (const [name, data] of Object.entries(MYSTERIES)) {
    if (data.days.includes(day)) {
      return { name, ...data }
    }
  }
  return { name: 'Joyful', ...MYSTERIES.Joyful }
}

export function buildRosarySteps(mysterySet) {
  const steps = []
  const { mysteries } = mysterySet

  // Opening
  steps.push({ type: 'prayer', prayer: 'signOfCross', bead: 'crucifix' })
  steps.push({ type: 'prayer', prayer: 'apostlesCreed', bead: 'crucifix' })
  steps.push({ type: 'prayer', prayer: 'ourFather', bead: 'tail_large' })
  steps.push({ type: 'hailMary', count: 1, total: 3, bead: 'tail_small_1', intention: 'Faith' })
  steps.push({ type: 'hailMary', count: 2, total: 3, bead: 'tail_small_2', intention: 'Hope' })
  steps.push({ type: 'hailMary', count: 3, total: 3, bead: 'tail_small_3', intention: 'Charity' })
  steps.push({ type: 'prayer', prayer: 'gloryBe', bead: 'tail_medal' })

  // Five decades
  mysteries.forEach((mystery, index) => {
    const decadeNum = index + 1

    steps.push({ type: 'mystery', mystery, decadeNum, bead: `decade_large_${decadeNum}` })
    steps.push({ type: 'prayer', prayer: 'ourFather', bead: `decade_large_${decadeNum}` })

    for (let i = 1; i <= 10; i++) {
      steps.push({
        type: 'hailMary',
        count: i,
        total: 10,
        bead: `decade_${decadeNum}_${i}`
      })
    }

    steps.push({ type: 'prayer', prayer: 'gloryBe', bead: `decade_large_${decadeNum}` })
    steps.push({ type: 'prayer', prayer: 'fatimaPlayer', bead: `decade_large_${decadeNum}` })
  })

  // Closing
  steps.push({ type: 'prayer', prayer: 'hailHolyQueen', bead: 'tail_medal' })
  steps.push({ type: 'prayer', prayer: 'signOfCross', bead: 'crucifix' })

  return steps
}